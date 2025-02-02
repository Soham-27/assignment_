from pydantic import BaseModel,ConfigDict
from datetime import datetime
from datetime import datetime

class FolderModel(BaseModel):
    id:str
    name:str
    model_config=ConfigDict(
        from_attributes=True
    )


class FileModel(BaseModel):
    id:str
    name:str
    size:str
    path:str
    folder_id:str
    uploaded_at:datetime

    model_config = ConfigDict(
        from_attributes= True,
        # json_schema_extra={
        #     "example":{
        #         "title":"Sample title",
        #         "content" : "Sample content"
        #     }
        # }
    )

class CreateFolderModel(BaseModel):
    name:str
    model_config=ConfigDict(
        from_attributes=True
    )

class FileCreate(BaseModel):
    folder_id: str
    file_name: str
    file_size: str
    file_path: str