from db import Base, engine
import asyncio

async def create_db():
    """
    Coroutine responsible for creating database tables.
    """
    async with engine.begin() as conn:
        from models import Folder, File

        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()

asyncio.run(create_db())
