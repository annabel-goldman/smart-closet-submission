import json
import boto3
import os
import time
import urllib.parse
import pymysql
import configparser
from botocore.exceptions import BotoCoreError, NoCredentialsError, ClientError

# Load configuration file
CONFIG_FILE = "finalproj.ini"

config = configparser.ConfigParser()
config.read(CONFIG_FILE)

try:
    # Read S3 Config
    S3_BUCKET_NAME = config.get("s3", "bucket_name")
    S3_REGION = config.get("s3", "region_name")

    # Read RDS (MySQL) Config
    DB_HOST = config.get("rds", "endpoint")
    DB_PORT = config.getint("rds", "port_number")
    DB_USER = config.get("rds", "user_name")
    DB_PASSWORD = config.get("rds", "user_pwd")
    DB_NAME = config.get("rds", "db_name")

except (configparser.NoSectionError, configparser.NoOptionError) as e:
    raise Exception(f"Missing configuration: {e}")

s3_client = boto3.client("s3")
textract_client = boto3.client("textract")
lambda_client = boto3.client("lambda")

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        cursorclass=pymysql.cursors.DictCursor
    )

def update_job_status(job_id, text_key=None):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = """UPDATE jobs SET textKey = %s WHERE jobId = %s"""
            cursor.execute(query, (text_key, job_id))
            conn.commit()
    finally:
        conn.close()

def check_s3_object_exists(bucket_name, object_key):
    try:
        s3_client.head_object(Bucket=bucket_name, Key=object_key)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            print(f"ERROR: File not found in S3: {object_key}")
        else:
            print(f"ERROR: S3 access issue: {str(e)}")
        return False

def lambda_handler(event, context):
    try:
        print("Lambda: Compute Lambda Triggered")

        bucket_name = event['Records'][0]['s3']['bucket']['name']
        bucket_key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        print(f"Processing file: s3://{bucket_name}/{bucket_key}")

        if not bucket_key.lower().endswith(".pdf"):
            raise ValueError("Uploaded file is not a PDF")

        job_id = bucket_key.split('.')[0] 

        if not check_s3_object_exists(bucket_name, bucket_key):
            update_job_status(job_id, "Error")
            return {'statusCode': 400, 'body': json.dumps({'error': 'File not found in S3'})}

        try:
            response = textract_client.start_document_text_detection(
                DocumentLocation={'S3Object': {'Bucket': bucket_name, 'Name': bucket_key}}
            )
            textract_job_id = response['JobId']
            print(f"Textract Job Started: {textract_job_id}")
        except ClientError as e:
            print(f"Textract API Error: {str(e)}")
            update_job_status(job_id, "Error")
            return {'statusCode': 500, 'body': json.dumps({'error': 'Textract start error', 'details': str(e)})}

        while True:
            job_status = textract_client.get_document_text_detection(JobId=textract_job_id)
            status = job_status['JobStatus']
            if status in ['SUCCEEDED', 'FAILED']:
                break
            print("Waiting for Textract job...")
            time.sleep(5)

        if status == 'FAILED':
            update_job_status(job_id, 'Error')
            raise Exception("Textract job failed")

        extracted_text = "\n".join(
            [block['Text'] for block in job_status.get('Blocks', []) if block.get('BlockType') == 'LINE']
        )

        text_key = f"{job_id}.txt"
        s3_client.put_object(
            Bucket=bucket_name, 
            Key=text_key, 
            Body=extracted_text.encode("utf-8"),
            ContentType='text/plain'
        )

        update_job_status(job_id, text_key)
        print(f"Extracted text stored at: s3://{bucket_name}/{text_key}")

        payload = json.dumps({'textKey': text_key, 'jobId': job_id})

        lambda_client.invoke(FunctionName='SummaryLambda', InvocationType='Event', Payload=payload)
        lambda_client.invoke(FunctionName='ImageLambda', InvocationType='Event', Payload=payload)
        lambda_client.invoke(FunctionName='MusicLambda', InvocationType='Event', Payload=payload)

        return {'statusCode': 200, 'body': json.dumps({'message': 'Processing started', 'textKey': text_key})}
    
    except (BotoCoreError, NoCredentialsError) as aws_error:
        print(f"AWS Error: {str(aws_error)}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'AWS error', 'details': str(aws_error)})}
    except Exception as e:
        print(f"Error: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
