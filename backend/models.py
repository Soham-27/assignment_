from db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Integer, String, DateTime, func
from datetime import datetime
# The database model for folders


class Folder(Base):
    __tablename__ = "folders"
    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Relationship to access files in the folder
    files = relationship("File", back_populates="folder")

    def __repr__(self) -> str:
        return f"<Folder {self.name}>"
    

# The database model for files
class File(Base):
    __tablename__ = "files"
    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    size: Mapped[str] = mapped_column(String, nullable=False)
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    folder_id: Mapped[str] = mapped_column(String, ForeignKey("folders.id"), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Relationship to access parent folder
    folder = relationship("Folder", back_populates="files")

    def __repr__(self) -> str:
        return f"<File {self.name} ({self.size} bytes)>"
