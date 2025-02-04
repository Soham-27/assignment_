# Google Drive Clone (FastAPI + Cloudflare R2 + PostgreSQL)

This project is a simplified Google Drive clone using **FastAPI**, **PostgreSQL**, and **Cloudflare R2** for file storage. It supports folder management and file operations via pre-signed URLs.

---

## 🚀 Features

✅ Create, update, and delete folders
✅ Upload files using pre-signed URLs (Cloudflare R2)
✅ List, delete, and download files
✅ PostgreSQL for metadata storage
✅ CORS support for frontend integration

---

## 🛠️ Tech Stack

- **FastAPI** (Backend API)
- **Cloudflare R2** (Object Storage)
- **PostgreSQL** (Database)
- **SQLAlchemy** (ORM for PostgreSQL)
- **boto3** (AWS SDK for Cloudflare R2)

---

## 🏗️ Architecture Diagram

![Architecture](./image.png)

## ⚙️ Installation & Setup

### 1️⃣ Backend Setup (FastAPI)

#### 🔹 Prerequisites

- Python 3.8+
- PostgreSQL installed & running
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

### 2️⃣ Frontend Setup (Optional)

If you have a separate frontend:

```bash
cd frontend
npm install  # Install dependencies
npm run dev  # Start frontend
```

Frontend will be available at: **http://localhost:3000**

---

## 🔗 API Endpoints

### 📁 Folder Management

| Method | Endpoint               | Description        |
| ------ | ---------------------- | ------------------ |
| GET    | `/folders`             | Get all folders    |
| POST   | `/folders`             | Create a folder    |
| PATCH  | `/folders/{folder_id}` | Update folder name |
| DELETE | `/folders/{folder_id}` | Delete folder      |

### 📄 File Management

| Method | Endpoint                  | Description                 |
| ------ | ------------------------- | --------------------------- |
| GET    | `/folders/{folder_id}`    | Get files in a folder       |
| POST   | `/file`                   | Add file metadata to DB     |
| DELETE | `/file/{file_id}`         | Delete file metadata        |
| GET    | `/generate-presigned-url` | Get pre-signed upload URL   |
| GET    | `/download-file`          | Get pre-signed download URL |

### 🩺 Health Check

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| GET    | `/health` | Check API status |
