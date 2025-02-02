from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

import os

load_dotenv()

DATABASE_URL = os.getenv("DB_URI")
print(DATABASE_URL)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables")

# Engine object to connect to the database
engine = create_async_engine(
    url=os.getenv("DB_URI"),
    echo=True
)

# Base class for creating database models
class Base(DeclarativeBase):
    pass


#postgresql+asyncpg://neondb_owner:npg_PVoLr1qwy5JE@ep-square-sun-a8tbjz20-pooler.eastus2.azure.neon.tech/neondb