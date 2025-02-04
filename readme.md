# Google Drive Clone (FastAPI + Cloudflare R2 + PostgreSQL)

This project is a simplified Google Drive clone using **FastAPI**, **PostgreSQL**, and **Cloudflare R2** for file storage. It supports folder management and file operations via pre-signed URLs.

---

## 🚀 Features

- ✅ Create, update, and delete folders
- ✅ Support Bulk file uploads (Cloudflare R2)
- ✅ List, delete, and download files

---

## 🛠️ Tech Stack

- **FastAPI** (Backend API)
- **Cloudflare R2** (Object Storage)
- **PostgreSQL** (Database)
- **SQLAlchemy** (ORM for PostgreSQL)
- **boto3** (AWS SDK for Cloudflare R2)

---

## 🏗️ Architecture Diagram

## ![Architecture](./image.png)

## Demo Video

## https://drive.google.com/file/d/1ZQMOLEjfQ21XP2O4wuaYoo05YE0BWYLs/view?usp=sharing

---

## ⚙️ Installation & Setup

### 1️⃣ Backend Setup (FastAPI)

#### 🔹 Prerequisites

- Python 3.8+
- Cloudflare R2 credentials

#### 🔹 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 🔹 Configure Environment Variables

Create a **.env** file and add:

```
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_ENDPOINT=your-r2-endpoint
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
```

#### 🔹 Start Backend Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: **http://localhost:8000**

Deployed Backend is at : **https://assignment-hnb0.onrender.com/**

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install  # Install dependencies
npm run dev  # Start frontend
```

Frontend will be available at: **http://localhost:3000**

---

## API Documentation

API documentation available at : **https://assignment-hnb0.onrender.com/docs**
