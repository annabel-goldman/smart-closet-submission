import json
import boto3
import uuid
import requests
import configparser
import base64
import datatier

# === Load Config ===
CONFIG_FILE = "SC.ini"
config = configparser.ConfigParser()
config.read(CONFIG_FILE)

try:
    # S3
    S3_BUCKET_NAME = config.get("s3", "bucket_name")
    S3_REGION = config.get("s3", "region_name")

    # RDS
    DB_HOST = config.get("rds", "endpoint")
    DB_PORT = config.getint("rds", "port_number")
    DB_USER = config.get("rds", "user_name")
    DB_PASSWORD = config.get("rds", "user_pwd")
    DB_NAME = config.get("rds", "db_name")

    # Gemini
    GEMINI_API_KEY = config.get("gemini", "api_key")

except Exception as e:
    raise Exception(f"Missing or invalid configuration: {e}")

# === AWS Clients ===
s3_client = boto3.client("s3", region_name=S3_REGION)

# === Utility Functions ===

def download_image_bytes_from_s3(s3_key):
    response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
    return response["Body"].read()

def generate_line_art_with_gemini(s3_key):
    """Uses Gemini 2.0 Flash to generate a cutesy line art image from an input image."""
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key={GEMINI_API_KEY}"

    # Get the image bytes from S3
    image_bytes = download_image_bytes_from_s3(s3_key)
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    headers = {
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            "Generate a an image of the clothing and accesories in this photo. Use soft colors, thick outlines, and a plain white background. "
                            "Avoid shadows and realistic textures—make it look like a clean digital sticker or illustration. "
                            "Focus on capturing the clothing style and shape clearly."
                        )
                    },
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": base64_image
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["Text", "Image"]
        }
    }

    response = requests.post(api_url, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Gemini Vision API error: {response.text}")

    try:
        parts = response.json()["candidates"][0]["content"]["parts"]
        for part in parts:
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])
        raise Exception("No image returned from Gemini.")
    except Exception as e:
        raise Exception(f"Failed to parse Gemini response: {str(e)}")

def upload_clipart_to_s3(user_id, original_id, image_bytes):
    new_s3_key = f"{user_id}/closet_items/{original_id}.png"
    s3_client.put_object(
        Bucket=S3_BUCKET_NAME,
        Key=new_s3_key,
        Body=image_bytes,
        ContentType="image/png"
    )
    return new_s3_key

def update_new_image_key(clothing_id, new_key):
    conn = datatier.get_dbConn(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
    try:
        sql = """
            UPDATE clothing_items
            SET new_image_s3_key = %s
            WHERE original_image_id = %s
        """
        datatier.perform_action(conn, sql, [new_key, clothing_id])
    finally:
        conn.close()

# === Lambda Entry Point ===

def lambda_handler(event, context):
    try:
        print("Lambda: SC_clipartCreator triggered.")

        body = json.loads(event.get("body", "{}")) if isinstance(event.get("body"), str) else event
        s3_key = body.get("s3_key")
        clothing_id = body.get("clothing_id")

        if not s3_key or not clothing_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing s3_key or clothing_id"})}

        # Get user_id from DB
        conn = datatier.get_dbConn(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
        row = datatier.retrieve_one_row(conn, "SELECT id, user_id FROM images WHERE s3_key = %s", [s3_key])
        conn.close()

        if not row:
            raise Exception("Image not found in database.")
        original_id = row[0]
        user_id = row[1]

        # Generate line art using Gemini
        print("Generating line art using Gemini...")
        clipart_bytes = generate_line_art_with_gemini(s3_key)

        # Upload new image to S3
        new_key = upload_clipart_to_s3(user_id, original_id, clipart_bytes)

        # Update DB with new image key
        update_new_image_key(clothing_id, new_key)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Clipart created and uploaded successfully using Gemini.",
                "new_image_s3_key": new_key
            })
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
