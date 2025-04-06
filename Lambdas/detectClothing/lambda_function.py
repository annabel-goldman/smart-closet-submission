import json
import boto3
import uuid
import requests
import configparser
import datatier

# === Load config ===
CONFIG_FILE = "SC.ini"
config = configparser.ConfigParser()
config.read(CONFIG_FILE)

try:
    # S3
    S3_BUCKET_NAME = config.get("s3", "bucket_name")
    S3_REGION = config.get("s3", "region_name")

    # RDS (MySQL)
    DB_HOST = config.get("rds", "endpoint")
    DB_PORT = config.getint("rds", "port_number")
    DB_USER = config.get("rds", "user_name")
    DB_PASSWORD = config.get("rds", "user_pwd")
    DB_NAME = config.get("rds", "db_name")

    # OpenAI
    OPENAI_API_KEY = config.get("openai", "api_key")

except (configparser.NoSectionError, configparser.NoOptionError) as e:
    raise Exception(f"Missing configuration: {e}")

# === AWS Clients ===
s3_client = boto3.client("s3", region_name=S3_REGION)

# === Utility Functions ===

def generate_presigned_image_url(s3_key, expiration=300):
    """Generate a temporary public URL to the image in S3."""
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=expiration
        )
        return url
    except Exception as e:
        raise Exception(f"Failed to generate presigned URL: {str(e)}")

def call_openai_with_image_url(image_url):
    """Send image URL to GPT-4 Turbo (Vision) and return response."""
    api_url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = (
        "Please analyze the following outfit image and return a list of identifiable clothing and accessory items. "
        "Only include items you are over 80% confident about. Exclude makeup, hairstyle, or background objects.\n\n"
        "For each item, return exactly one line in the following format:\n"
        "**Clothing Type, Color, Material, Style, Extra Info**\n\n"
        "Respond with one line per item. Do not include bullet points, numbering, or any explanation.\n"
        "Example response:\n"
        "T-Shirt, Red, Cotton, Casual, Graphic print on front\n"
        "Sunglasses, Black, Plastic, Aviator, Reflective lenses"
    )


    payload = {
        "model": "gpt-4-turbo",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ],
        "max_tokens": 800
    }

    response = requests.post(api_url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"].strip()
    else:
        raise Exception(f"OpenAI Vision API error: {response.text}")

def parse_clothing_response(text):
    """Parse OpenAI text into structured clothing items."""
    lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
    clothing_items = []
    for line in lines:
        parts = [p.strip() for p in line.split(",")]
        if len(parts) == 5:
            clothing_items.append({
                "clothing_type": parts[0],
                "color": parts[1],
                "material": parts[2],
                "style": parts[3],
                "extra_info": parts[4]
            })
    return clothing_items

def insert_clothing_items_to_db(image_id, user_id, clothing_items):
    """Insert parsed clothing items into the DB."""
    conn = datatier.get_dbConn(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
    try:
        for item in clothing_items:
            clothing_id = str(uuid.uuid4())

            sql = """
                INSERT INTO clothing_items (
                    id, original_image_id, clothing_type, color,
                    material, style, extra_info
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            datatier.perform_action(conn, sql, [
                clothing_id,
                image_id,
                item["clothing_type"],
                item["color"],
                item["material"],
                item["style"],
                item["extra_info"],
            ])
    finally:
        conn.close()

# === Lambda Entry Point ===

def lambda_handler(event, context):
    try:
        print("Lambda: SC_detectClothing triggered.")

        body = json.loads(event.get("body", "{}")) if isinstance(event.get("body"), str) else event
        s3_key = body.get("s3_key")

        if not s3_key:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing s3_key"})}

        # Step 1: Generate presigned URL to the image
        image_url = generate_presigned_image_url(s3_key)

        # Step 2: Send image URL to OpenAI for vision analysis
        response_text = call_openai_with_image_url(image_url)
        print("OpenAI Response:\n", response_text)

        # Step 3: Parse the response into structured clothing item data
        clothing_items = parse_clothing_response(response_text)
        if not clothing_items:
            raise Exception("No valid clothing items found in AI response.")

        # Step 4: Look up image + user ID from DB
        conn = datatier.get_dbConn(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
        image_row = datatier.retrieve_one_row(conn, "SELECT id, user_id FROM images WHERE s3_key = %s", [s3_key])
        conn.close()

        if not image_row:
            raise Exception("Image not found in DB.")

        image_id, user_id = image_row

        # Step 5: Insert the clothing items into clothing_items table
        insert_clothing_items_to_db(image_id, user_id, clothing_items)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Clothing detection completed successfully.",
                "num_items_detected": len(clothing_items)
            })
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
