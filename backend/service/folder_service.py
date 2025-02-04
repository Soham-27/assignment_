from database.models import Folder
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select
import uuid
from sqlalchemy.exc import SQLAlchemyError

class FolderService:
    async def get_all(self, async_session: async_sessionmaker[AsyncSession]):
        try:
            async with async_session() as session:
                statement = select(Folder).order_by(Folder.id)
                result = await session.execute(statement)
                return result.scalars().all()
        except SQLAlchemyError as e:
            raise Exception(f"Database error: {str(e)}")

    async def add(self, async_session: async_sessionmaker[AsyncSession], folder_name: str):
        try:
            async with async_session() as session:
                new_folder = Folder(id=str(uuid.uuid4()), name=folder_name)
                session.add(new_folder)
                await session.commit()
                await session.refresh(new_folder)
                return new_folder
        except SQLAlchemyError as e:
            raise Exception(f"Failed to create folder: {str(e)}")
        
    async def update_by_id(self, async_session: async_sessionmaker[AsyncSession], folder_id: str, folder_name: str):
        try:
            async with async_session() as session:
                statement = select(Folder).filter(Folder.id == folder_id)
                result = await session.execute(statement)
                folder = result.scalars().one_or_none()
                if not folder:
                    raise Exception("Folder not found")
                folder.name = folder_name
                await session.commit()
                return folder
        except SQLAlchemyError as e:
            raise Exception(f"Failed to update folder: {str(e)}")

    async def delete_by_id(self, async_session: async_sessionmaker[AsyncSession], folder_id: str):
        try:
            async with async_session() as session:
                statement = select(Folder).filter(Folder.id == folder_id)
                result = await session.execute(statement)
                folder = result.scalars().one_or_none()
                if not folder:
                    raise Exception("Folder not found")
                await session.delete(folder)
                await session.commit()
                return {"message": "Folder deleted successfully"}
        except SQLAlchemyError as e:
            raise Exception(f"Failed to delete folder: {str(e)}")

