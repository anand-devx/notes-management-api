# 🗒️ Notes API

## 📘 Project Overview

This is a secure, user-authenticated **Notes API** built with **Node.js**, **Express**, and **MongoDB**. It offers user registration, JWT-based authentication, token refreshing, logout, profile management, and full CRUD operations for personal notes, including optional image upload (cover images) to Cloudinary.

Each user can create, view, update, and delete their own notes privately. Image deletion from Cloudinary is also handled when notes are updated or deleted.

---

## ⚙️ Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB** + **Mongoose**
- **JWT (JSON Web Tokens)**
- **bcrypt**
- **multer**
- **dotenv**
- **express-async-handler**
- **cookie-parser**
- **CORS**
- **Cloudinary SDK**

---
## 🛠️ Running Instructions

1. Clone the repository:

```bash
git clone https://github.com/anand-devx/notes-management-api.git
cd notes-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables : For this particular submission, I have pushed the .env file, so no need to setup Environment Variables (Just make sure for PORT 5000 to be free while running this app.)
- Rename .env.example to .env
- Fill in the values (see .env section below)

4. Run the development server:

```bash
npm run dev
```
---
## 🧪 Sample POSTMAN Request Flows

- Download the below file, and import it to POSTMAN, and You are ready to use the API, Just need to add your values to the empty spaces...
  - POSTMAN Collections JSON File : [Notes.json](https://drive.google.com/file/d/1_DCa8PBm7l84NfDrinw9hS4rHvl0hE8D/view?usp=sharing)

---
## 📌 API Routes Documentation

📽️ API Demo: [Watch on YouTube](https://youtu.be/8EQ1LvNKE4s)

---

### 🔐 Authentication

#### `POST /register`
Register a new user.

- Content-Type: `multipart/form-data`
- Body:
  - `username` (string)
  - `email` (string)
  - `password` (string)
  - `fullName` (string)
  - `avatar` (optional file)

#### `POST /login`
Login using either `email` or `username`.

- Body:
  - `email` (string)
  - `username` (string)
  - `password` (string)

#### `POST /logout`
Logout the user.

- Header: `Authorization: Bearer <accessToken>`

#### `POST /refresh-tokens`
Refresh access & refresh tokens.

- Body:
  - `refreshToken` (optional string — needed if not logged in)

---

### 👤 User Profile

#### `POST /change-password`

- Header: `Authorization: Bearer <accessToken>`
- Body:
  - `oldPassword` (string)
  - `newPassword` (string)

#### `POST /update-details`

- Content-Type: `multipart/form-data`
- Header: `Authorization: Bearer <accessToken>`
- Body:
  - `fullName` (string)
  - `email` (string)
  - `avatar` (file)

---

### 📝 Notes

#### `POST /notes/create`
Create a new note.

- Content-Type: `multipart/form-data`
- Header: `Authorization: Bearer <accessToken>`
- Body:
  - `title` (string)
  - `content` (string)
  - `tags` (array of strings — use multiple fields with same key)
  - `about` (string)
  - `isPinned` (boolean)
  - `coverImage` (file — optional)

#### `GET /notes/read-all`
Fetch all notes by the logged-in user.

- Header: `Authorization: Bearer <accessToken>`

#### `GET /notes/read-one/:title`
Fetch a single note by its title.

- Header: `Authorization: Bearer <accessToken>`
- Path Param: `:title`

#### `POST /notes/update/:noteID`
Update an existing note.

- Header: `Authorization: Bearer <accessToken>`
- Content-Type: `multipart/form-data`
- Path Param: `:noteID`
- Body (same as note creation fields)

#### `GET /notes/delete/:noteID`
Delete a note by ID and its image from Cloudinary (if any).

- Header: `Authorization: Bearer <accessToken>`
- Path Param: `:noteID`

---


## 🧾 .env File Example

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_uri
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```
