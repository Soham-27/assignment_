import boto3.session
from fastapi import FastAPI,HTTPException,Query

from sqlalchemy.ext.asyncio import async_sessionmaker
from database.db import engine
from schema import FolderModel,FileModel,CreateFolderModel,FileCreate
from http import HTTPStatus
import uuid
from database.models import Folder,File
from typing import List

from fastapi.middleware.cors import CORSMiddleware
import boto3
from botocore.config import Config
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import dotenv
import os
from fastapi import FastAPI
from schedular import start_scheduler,stop_scheduler
from routes.health import router as health_router
from contextlib import asynccontextmanager
from routes.folder_controller import router as folder_router
from routes.file_controller import router as file_router
from routes.r2_controller import router as r2_router

dotenv.load_dotenv()
 
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")

# Initialize S3 client for Cloudflare R2
s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,     
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
    config=boto3.session.Config(signature_version='s3v4')
)



app=FastAPI(
    title="Google Drive API",
    description="Assignement",
)

app.include_router(health_router)
app.include_router(folder_router)
app.include_router(file_router)
app.include_router(r2_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, replace with specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
session=async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)


@app.get("/health")
async def hello():
    return {"message":"Hello World !!"}






@app.get("/generate-presigned-url/")
def generate_presigned_url(file_name: str):
    if not file_name:
        raise HTTPException(status_code=400, detail="Missing file_name")
    try:
        file_key = f"assignment/{file_name}"
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": R2_BUCKET_NAME, "Key": file_key},
            ExpiresIn=3600,
        )
        return {"url": presigned_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download-file/")
def generate_download_url(file_name: str = Query(...)):
    """
    Generates a pre-signed URL for downloading a file from Cloudflare R2.
    """
    try:
        # Possible file paths in R2
        file_key = f"assignment/{file_name}"

        # Generate a pre-signed URL for downloading the file
        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": R2_BUCKET_NAME, "Key": file_key},
            ExpiresIn=3600,  # URL valid for 1 hour
        )
        
        return {"url": presigned_url}
    
    except (NoCredentialsError, PartialCredentialsError):
        return {"error": "Invalid credentials."}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}
