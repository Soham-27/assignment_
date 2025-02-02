from models import Folder, File
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select
from datetime import datetime
import uuid
class FileService:
    async def get_files_for_specific_folder(self, async_session: async_sessionmaker[AsyncSession], folder_id: str):
        async with async_session() as session:
            statement = select(File).where(File.folder_id == folder_id)
            result = await session.execute(statement)
            files = result.scalars().all()
            return files
        

        
    async def add_file(self,async_session: async_sessionmaker[AsyncSession], folder_id:File.folder_id, file_name:File.name, file_size:File.size, file_path:File.path):
        async with async_session() as session:
                # Create a new File instance
                new_file = File(
                    id=str(uuid.uuid4()),
                    name=file_name,
                    size=file_size,
                    path=file_path,
                    folder_id=folder_id,
                    uploaded_at=datetime.now()
                )

                # Add the new file to the session
                session.add(new_file)
                await session.commit()

                return new_file

    async def delete_file_by_id(self,async_session: async_sessionmaker[AsyncSession],file_id:str):
        async with async_session() as session:
                statement=select(File).filter(File.id==file_id)
                result=await session.execute(statement)

                file=result.scalars().one()

                await session.delete(file)
                await session.commit()

                return {}
        