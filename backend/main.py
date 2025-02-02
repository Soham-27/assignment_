import boto3.session
from fastapi import FastAPI,HTTPException,Query
from folder_controller import FolderService
from sqlalchemy.ext.asyncio import async_sessionmaker
from db import engine
from schema import FolderModel,FileModel,CreateFolderModel,FileCreate
from http import HTTPStatus
import uuid
from models import Folder,File
from typing import List
from file_controller import FileService
from fastapi.middleware.cors import CORSMiddleware
import boto3
from botocore.config import Config
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import dotenv
import os
dotenv.load_dotenv()

R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_ENDPOINT = os.getenv("R2_ENDPOINT")
print(R2_ACCESS_KEY_ID)
print(R2_SECRET_ACCESS_KEY)
print(R2_BUCKET_NAME)
print(R2_ENDPOINT)

# Initialize S3 client for Cloudflare R2
s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY_ID,     
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
    config=boto3.session.Config(signature_version='s3v4')
)



folder_service=FolderService()
file_service=FileService()

app=FastAPI(
    title="Google Drive API",
    description="Assignement"
)
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

###############################FOLDER ROUTES################################################
@app.get("/folders",response_model=list[FolderModel])
async def get_all_folders():
    folders=await folder_service.get_all(session)
    return folders

@app.post("/folders",response_model=FolderModel,status_code=HTTPStatus.CREATED)
async def create_folder(folder_data:CreateFolderModel)->dict:
    new_folder=Folder(
        id=str(uuid.uuid4()),
        name=folder_data.name
    )
    folder=await folder_service.add(session,new_folder)
    return folder   
    

@app.delete("/folders/{folder_id}")
async def delete_folder(folder_id:str):
    await folder_service.delete_by_id(session,folder_id=folder_id)
    
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



@app.get("/list-files/")
def list_files():
    response = s3_client.list_objects_v2(Bucket=R2_BUCKET_NAME)
    if "Contents" in response:
        return {"files": [obj["Key"] for obj in response["Contents"]]}
    return {"files": []}

@app.patch("/folders/{folder_id}",response_model=FolderModel)
async def update_folder(folder_id:str,data:CreateFolderModel):  
    folder=await folder_service.update_folder_by_id(session,folder_id=folder_id,data=data)
    return folder


###############################################################################################################
################################################FILE ROUTES####################################################
###############################################################################################################


@app.get('/folders/{folder_id}',response_model=list[FileModel])
async def get_files_by_folder_id(folder_id:str):
    files=await file_service.get_files_for_specific_folder(session,folder_id)
    return files


@app.delete('/file/{file_id}')
async def delete_file(file_id:str):
    await file_service.delete_file_by_id(session,file_id=file_id)
    
    


@app.post("/file",response_model=FileModel)
async def add_file(file_data:FileCreate):
    print(file_data)
    file=await file_service.add_file(session,
                file_data.folder_id,
                file_data.file_name,
                file_data.file_size,
                file_data.file_path)
    return file
