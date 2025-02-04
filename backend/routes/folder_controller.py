from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import async_sessionmaker
from schema import FolderModel, CreateFolderModel
from database.db import engine
from service.folder_service import FolderService
from http import HTTPStatus
from typing import List

router = APIRouter()
folder_service = FolderService()
session = async_sessionmaker(bind=engine, expire_on_commit=False)

@router.get("/folders", response_model=List[FolderModel])
async def get_all_folders():
    try:
        return await folder_service.get_all(session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/folders", response_model=FolderModel, status_code=HTTPStatus.CREATED)
async def create_folder(folder_data: CreateFolderModel):
    try:
        return await folder_service.add(session, folder_data.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/folders/{folder_id}", response_model=FolderModel)
async def update_folder(folder_id: str, data: CreateFolderModel):  
    try:
        return await folder_service.update_by_id(session, folder_id, data.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/folders/{folder_id}")
async def delete_folder(folder_id: str):
    try:
        await folder_service.delete_by_id(session, folder_id)
        return {"message": "Folder deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
