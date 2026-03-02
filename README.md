# 🎬 Streaming Backend API

Backend service for the Streaming Web App.
Built with Node.js, Express, MongoDB.

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Docker
- AWS EC2
- AWS S3 (Storage)
- Caddy (Reverse Proxy)

## ⚙️ Environment Variables

MONGODB_URI=
DATABASE_NAME=

LOCAL_DEV_APP_HOST=
LOCAL_DEV_APP_PORT=

WEBSITE_DOMAIN_DEVELOPMENT=
WEBSITE_DOMAIN_PRODUCTION=

ADMIN_EMAIL_ADDRESS=
ADMIN_EMAIL_NAME=

ACCESS_TOKEN_PRIVATE_KEY=
ACCESS_TOKEN_LIFE=
REFRESH_TOKEN_PRIVATE_KEY=
REFRESH_TOKEN_LIFE=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
RESEND_ADMIN_SENDER_EMAIL=

## 🔎 Environment Variables Explanation

MONGODB_URI – MongoDB connection string
DATABASE_NAME – Database name

LOCAL_DEV_APP_HOST – Usually localhost
LOCAL_DEV_APP_PORT – Example: 8017

WEBSITE_DOMAIN_DEVELOPMENT – Frontend dev domain
WEBSITE_DOMAIN_PRODUCTION – Production domain

ACCESS_TOKEN_PRIVATE_KEY – Secret for access token
ACCESS_TOKEN_LIFE – Example: 15m
REFRESH_TOKEN_PRIVATE_KEY – Secret for refresh token
REFRESH_TOKEN_LIFE – Example: 7d

Cloudinary (Media Storage)
Used for storing movie thumbnails and assets

Resend (Email Service)
Used for sending verification emails and system notifications

## 🚀 Run Locally

yarn install
yarn dev

## 🐳 Run with Docker

docker build -t streaming-backend
docker run -p 5000:8017 streaming-backend

## 🌐 Frontend Repository

👉 https://github.com/EziioNg/moviehub-fe
