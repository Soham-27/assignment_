import boto3
import os
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from fastapi import HTTPException

def get_s3_client():
    """Initialize and return the S3 client for Cloudflare R2."""
    return boto3.client(
        "s3",
        endpoint_url=os.getenv("R2_ENDPOINT"),
        aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
        config=boto3.session.Config(signature_version='s3v4')
    )

s3_client = get_s3_client()

def generate_presigned_upload_url(file_name: str):
    """Generates a pre-signed URL for uploading a file."""
    if not file_name:
        raise HTTPException(status_code=400, detail="Missing file_name")
    try:
        file_key = f"assignment/{file_name}"
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": os.getenv("R2_BUCKET_NAME"), "Key": file_key},
            ExpiresIn=3600,
        )
        return {"url": presigned_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_presigned_download_url(file_name: str):
    """Generates a pre-signed URL for downloading a file."""
    try:
        file_key = f"assignment/{file_name}"
        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": os.getenv("R2_BUCKET_NAME"), "Key": file_key},
            ExpiresIn=3600,
        )
        return {"url": presigned_url}
    except (NoCredentialsError, PartialCredentialsError):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

