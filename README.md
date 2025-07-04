# 🗒️ Notes API

## 📘 Project Overview  
This is a secure, user-authenticated Notes API built using **Node.js**, **Express**, and **MongoDB**. It supports user registration, login with JWT-based authentication, token refreshing, logout, and personal details and note management. Each user can create, view, and manage their own notes privately.

---

## ⚙️ Technologies Used  

- Node.js  
- Express.js  
- MongoDB with Mongoose  
- JWT (JSON Web Tokens)  
- bcrypt  
- multer  
- dotenv  
- express-async-handler  
- cookie-parser
- cors

---

## 📌 API Routes Documentation
API routes Demo : [Notes Api Demo Video](https://youtu.be/8EQ1LvNKE4s)
### 🔐 Authentication

#### `POST /register`
Registers a new user.  
- Accepts: `multipart/form-data` (with optional `avatar`)
- Body:
  - `username` (string)
  - `email` (string)
  - `password` (string)
  - `fullName` (string)
  - `avatar` (optional file)

#### `POST /login`
Logs in a user and returns JWT tokens. Atleast one of email or username is required. 
- Body:
  - `email` (string)
  - `username` (string)
  - `password` (string)

#### `POST /logout`
Logs out the user.  
- Requires `Authorization: Bearer <accessToken>` in case user is not logged in. 

#### `POST /refresh-tokens`
Generates new access token and refresh token using refresh token.  
- Body:
  - `refreshToken` (string) - only needed if user not logged in

---

### 👤 User Profile

#### `POST /change-password`
Changes user's password.  
- Protected route
- Requires `Authorization: Bearer <accessToken>` in case user is not logged in. 
- Body:
  - `oldPassword` (string)
  - `newPassword` (string)

#### `POST /update-details`
Updates user's profile info or avatar.  
- Protected route
- Requires `Authorization: Bearer <accessToken>` in case user is not logged in. 
- Accepts: `multipart/form-data`
- Body:
  - `fullName` (string)
  - `email` (string)
  - `avatar` (file)

---

### 📝 Notes

#### `POST /notes/create`
Create a new note.  
- Protected route
- Requires `Authorization: Bearer <accessToken>` in case user is not logged in.
- Accepts: `multipart/form-data` (with optional `coverImage`)
- Body:
  - `title` (string)
  - `content` (string)
  - `tags` (array of strings) (pass multiple values with the same Key(tags) in postman form data, to create the array)
  - `about` (string)
  - `isPinned` (boolean)
  - `coverImage` (file)

#### `GET /notes/read-all`
Fetch all notes of the logged-in user.  
- Protected route
- Requires `Authorization: Bearer <accessToken>` in case user is not logged in.
  
#### `GET /notes/read-one/:title`
Fetch a specific note by title.  
- Protected route
- Requires `Authorization: Bearer <accessToken>` in case user is not logged in.
- Send the value of `title` for Path variable `:title`.(Through Params Tab on Postman)

---

## 🛠️ Running Instructions

1. Clone the repository:

```bash
git clone https://github.com/anand-devx/notes-api.git  
cd notes-api  
```

2. Install dependencies:

```bash
npm install  
```

3. Set up environment variables : For this particular submission, I have pushed the `.env` file, so no need to setup Environment Variables (Just make sure for PORT 5000 to be free while running this app.)
- Rename `.env.example` to `.env`
- Fill in the values (see `.env` section below)

4. Run the development server:

```bash
npm run dev  
```

---
## 🧪 Sample POSTMAN Request Flows

- Download the below file, and import it to POSTMAN, and You are ready to use the API, Just need to add your values to the empty spaces...
  - POSTMAN Collections JSON File : [Notes.json](https://drive.google.com/file/d/1_DCa8PBm7l84NfDrinw9hS4rHvl0hE8D/view?usp=sharing)

---

## 🧾 .env File Details
Below is the .env sample file, it is also included in the repository:
```env
PORT=
MONGODB_URI=
CORS_ORIGIN=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=
CLOUD_NAME=
API_KEY=
API_SECRET=
NODE_ENV=
```
