from database.models import File
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select
from datetime import datetime
import uuid
from sqlalchemy.exc import SQLAlchemyError
import boto3
import os

# Load environment variables for Cloudflare R2
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

class FileService:
    async def get_files_for_specific_folder(self, async_session: async_sessionmaker[AsyncSession], folder_id: str):
        try:
            async with async_session() as session:
                statement = select(File).where(File.folder_id == folder_id)
                result = await session.execute(statement)
                return result.scalars().all()
        except SQLAlchemyError as e:
            raise Exception(f"Database error: {str(e)}")

    async def add_file(self, async_session: async_sessionmaker[AsyncSession], folder_id: str, file_name: str, file_size: str, file_path: str):
        try:
            async with async_session() as session:
                new_file = File(
                    id=str(uuid.uuid4()),
                    name=file_name,
                    size=file_size,
                    path=file_path,
                    folder_id=folder_id,
                    uploaded_at=datetime.now()
                )
                session.add(new_file)
                await session.commit()
                await session.refresh(new_file)
                return new_file
        except SQLAlchemyError as e:
            raise Exception(f"Failed to add file: {str(e)}")

    async def delete_file_by_id(self, async_session: async_sessionmaker[AsyncSession], file_id: str):
        try:
            async with async_session() as session:
                statement = select(File).filter(File.id == file_id)
                result = await session.execute(statement)
                file = result.scalars().one_or_none()
                if not file:
                    raise Exception("File not found")
                
                # Delete file from R2 storage
                file_key = f"assignment/{file.name}"
                s3_client.delete_object(Bucket=R2_BUCKET_NAME, Key=file_key)
                
                await session.delete(file)
                await session.commit()
                return {"message": "File deleted successfully"}
        except SQLAlchemyError as e:
            raise Exception(f"Failed to delete file: {str(e)}")
        except Exception as e:
            raise Exception(f"Error deleting file from storage: {str(e)}")

