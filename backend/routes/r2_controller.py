from fastapi import APIRouter, Query
from service.r2_service import generate_presigned_upload_url, generate_presigned_download_url

router = APIRouter()

@router.get("/generate-presigned-url/")
def get_upload_url(file_name: str):
    return generate_presigned_upload_url(file_name)

@router.get("/download-file/")
def get_download_url(file_name: str = Query(...)):
    return generate_presigned_download_url(file_name)