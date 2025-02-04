from fastapi import APIRouter, HTTPException
from sqlalchemy.ext.asyncio import async_sessionmaker
from schema import FileModel, FileCreate
from database.db import engine
from service.file_service import FileService
from http import HTTPStatus
from typing import List

router = APIRouter()
file_service = FileService()
session = async_sessionmaker(bind=engine, expire_on_commit=False)

@router.get("/folders/{folder_id}", response_model=List[FileModel])
async def get_files_by_folder_id(folder_id: str):
    try:
        return await file_service.get_files_for_specific_folder(session, folder_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/file", response_model=FileModel, status_code=HTTPStatus.CREATED)
async def add_file(file_data: FileCreate):
    try:
        return await file_service.add_file(session, file_data.folder_id, file_data.file_name, file_data.file_size, file_data.file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/file/{file_id}")
async def delete_file(file_id: str):
    try:
        return await file_service.delete_file_by_id(session, file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
