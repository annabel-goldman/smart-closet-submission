# lambda_function.py for SC_getCloset (with signed S3 URLs)
import json
import boto3
import configparser
from datatier import get_dbConn, retrieve_all_rows

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

# AWS client
s3_client = boto3.client("s3", region_name=S3_REGION)

# Common CORS headers
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
}

def lambda_handler(event, context):
    try:
        # Handle CORS preflight
        if event["httpMethod"] == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"message": "CORS preflight OK"})
            }

        incoming_user_id = event.get("pathParameters", {}).get("userid", "").strip()
        user_id = ''.join(c for c in incoming_user_id if c.isalnum())

        if not user_id:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Missing user_id in path"})
            }

        conn = get_dbConn(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
        try:
            sql = """
                SELECT c.id, c.clothing_type, c.color, c.material, c.style, c.extra_info, c.new_image_s3_key
                FROM clothing_items c
                JOIN images i ON c.original_image_id = i.id
                WHERE i.user_id = %s
            """
            items = retrieve_all_rows(conn, sql, [user_id])
        finally:
            conn.close()

        if not items:
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"items": []})
            }

        results = []
        for row in items:
            print(row)
            clothing_id, clothing_type, color, material, style, extra_info, s3_key = row

            signed_url = None
            if s3_key:
                try:
                    signed_url = s3_client.generate_presigned_url(
                        "get_object",
                        Params={"Bucket": S3_BUCKET, "Key": s3_key},
                        ExpiresIn=3600  # 1 hour
                    )
                except Exception as e:
                    print(f"Error generating signed URL (key: {s3_key}): {e}")

            results.append({
                "clothing_id": clothing_id,
                "clothing_type": clothing_type,
                "color": color,
                "material": material,
                "style": style,
                "extra_info": extra_info,
                "new_image_s3_key": s3_key,
                "image_url": signed_url
            })

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"items": results})
        }

    except Exception as e:
        print("Error in SC_getCloset:", str(e))
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }
