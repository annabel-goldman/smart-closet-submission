import json
import base64
import uuid
import boto3
import configparser
from datatier import get_dbConn, perform_action, retrieve_one_row

# Load config
CONFIG_FILE = "SC.ini"
config = configparser.ConfigParser()
config.read(CONFIG_FILE)

# S3 config
S3_BUCKET = config.get("s3", "bucket_name")
S3_REGION = config.get("s3", "region_name")

# RDS config
DB_HOST = config.get("rds", "endpoint")
DB_PORT = config.getint("rds", "port_number")
DB_USER = config.get("rds", "user_name")
DB_PASSWORD = config.get("rds", "user_pwd")
DB_NAME = config.get("rds", "db_name")

# AWS Clients
s3_client = boto3.client("s3", region_name=S3_REGION)
lambda_client = boto3.client("lambda")

# Lambda function names
DETECT_CLOTHING_FUNCTION = "SC_detectClothing"
CLIPART_CREATOR_FUNCTION = "SC_clipartCreator"

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",  # Update to your domain for production
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    }

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps("Preflight OK")
        }

    try:
        # Parse request body
        body = json.loads(event['body']) if 'body' in event else event
        incoming_user_id = body['user_id'].strip()
        user_id = ''.join(c for c in incoming_user_id if c.isalnum())


        filename = body['filename']
        file_content_b64 = body['file_content']

        # Decode image from base64
        image_bytes = base64.b64decode(file_content_b64)

        # Connect to DB
        conn = get_dbConn(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
        try:
            # Check if user exists
            user_check = retrieve_one_row(conn, "SELECT id FROM users WHERE id = %s", [user_id])
            if not user_check:
                perform_action(conn, "INSERT INTO users (id) VALUES (%s)", [user_id])
                print(f"New user created: {user_id}")
            else:
                print(f"User exists: {user_id}")

            # Prepare image upload
            image_id = str(uuid.uuid4())
            ext = filename.split('.')[-1]
            s3_key = f"{user_id}/{image_id}.{ext}"

            # Upload to S3
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=image_bytes,
                ContentType="image/jpeg"
            )

            # Save image record
            sql = """
                INSERT INTO images (id, user_id, s3_key)
                VALUES (%s, %s, %s)
            """
            perform_action(conn, sql, [image_id, user_id, s3_key])

        finally:
            conn.close()

        # Trigger SC_detectClothing Lambda
        lambda_client.invoke(
            FunctionName=DETECT_CLOTHING_FUNCTION,
            InvocationType="Event",
            Payload=json.dumps({"s3_key": s3_key})
        )
        print(f"Invoked SC_detectClothing for {s3_key}")

        # Trigger SC_clipartCreator Lambda
        lambda_client.invoke(
            FunctionName=CLIPART_CREATOR_FUNCTION,
            InvocationType="Event",
            Payload=json.dumps({
                "s3_key": s3_key,
                "clothing_id": image_id
            })
        )
        print(f"Invoked SC_clipartCreator for {s3_key}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Upload successful. Clothing detection and clipart generation started.',
                'user_id': user_id,
                'image_id': image_id,
                's3_key': s3_key
            })
        }

    except Exception as e:
        print("Upload failed:", str(e))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
