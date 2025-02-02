from models import Folder, File
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select


class FolderService:
    async def get_all(self, async_session: async_sessionmaker[AsyncSession]):
        async with async_session() as session:
            statement = select(Folder).order_by(Folder.id)
            result = await session.execute(statement)
            return result.scalars().all()

    async def add(self, async_session: async_sessionmaker[AsyncSession], folder: Folder):
        async with async_session() as session:
            if not folder.name:
                return {"message": "Name is required"}
            session.add(folder)
            await session.commit()
            await session.refresh(folder)
            return folder
        
    async def update_folder_by_id(self, async_session: async_sessionmaker[AsyncSession], folder_id:Folder.id, data: dict):
        async with async_session() as session:
            statement = select(Folder).filter(Folder.id == folder_id)

            result = await session.execute(statement)

            folder = result.scalars().one()

            folder.name = data.name

            await session.commit()
            
            return folder


    async def delete_by_id(self, async_session: async_sessionmaker[AsyncSession], folder_id: int):
        async with async_session() as session:
            statement = select(Folder).filter(Folder.id == folder_id)
            result = await session.execute(statement)
            folder = result.scalars().one()
            
            await session.delete(folder)
            await session.commit()
            
            return{} # Folder not found
