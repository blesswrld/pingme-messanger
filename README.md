# PingMe Messenger (en)

**PingMe** is a real-time web-based messenger application designed for instant communication. Developed with React and Vite, it offers a seamless user experience for live messaging powered by Socket.io. The application integrates Yandex.Cloud for robust file storage and photo sharing, utilizes MongoDB as its database, and features a modern, responsive interface styled with Tailwind CSS.

## 📸 Screenshots

Welcome to PingMe! Here's a visual tour of the application's key features and user interface.

---

### 🔑 Sign Up Page
Easy account creation to join the PingMe community.
![Login Page](https://i.ibb.co/SDTBss2x/image.png)

---

### ✍️ Login Page
Secure and straightforward login process to access your conversations. Supports email/password authentication.
![Sign Up Page](https://i.ibb.co/TxYX2rKz/image.png)

---

### 🏠 Home - No Chat Selected
The initial view of the home page when no chat is selected, inviting users to start a conversation.
![Home - No Chat Selected](https://i.ibb.co/ttdWwfn/image.png)

---

### 💬 Chat View (Active Conversation)
Dynamic real-time chat interface with message history, online status, and multimedia support.
![Chat Selected](https://i.ibb.co/4Z0R2g6P/image.png)

---

### 👤 User Profile
Personalized user profiles where users can update their avatar, username, and bio.
![Profile Page](https://i.ibb.co/bgbKynLP/image.png)

---

### ⚙️ Settings Page
Customizable application settings, including theme selection with a live preview.
![Settings Page](https://i.ibb.co/Y4wzwxpp/image.png)
## ⚙️ Environment Variables

To run this project, you will need to create a `.env` file in the `backend` directory and add the following environment variables:

| Variable                  | Description                                                                 | Example / Default                          |
| :------------------------ | :-------------------------------------------------------------------------- | :----------------------------------------- |
| **MongoDB Configuration** |                                                                             |                                            |
| `MONGODB_URI`             | Your MongoDB connection string.                                             | `mongodb+srv://<USER>:<PASS>@cluster/...` |
| **Server Configuration**  |                                                                             |                                            |
| `PORT`                    | The port for the backend server.                                            | `5001`                                     |
| `JWT_SECRET`              | Secret key for JWT signing (use a strong, random string).                   | `YOUR_STRONG_JWT_SECRET`                   |
| `NODE_ENV`                | Application environment (`development` or `production`).                  | `development`                              |
| `API_BASE_URL`            | Base URL for the API.                                                       | `http://localhost:5001/api`                |
| **Yandex Object Storage** |                                                                             |                                            |
| `AWS_ACCESS_KEY_ID`       | Yandex Cloud Static Access Key ID.                                          | `YOUR_YANDEX_STATIC_KEY_ID`                |
| `AWS_SECRET_ACCESS_KEY`   | Yandex Cloud Static Access Key Secret.                                      | `YOUR_YANDEX_STATIC_KEY_SECRET`            |
| `AWS_S3_BUCKET_NAME`      | Name of your Yandex Object Storage bucket.                                  | `pingme-messanger-pics`                    |
| `AWS_S3_REGION`           | Region of your Yandex Object Storage bucket.                                | `ru-central1`                              |
| `AWS_S3_ENDPOINT_URL`     | Endpoint URL for Yandex Object Storage.                                     | `https://storage.yandexcloud.net`          |

**Note:** Make sure to replace placeholder values (like `<YOUR_USERNAME>:<YOUR_PASSWORD>`, `YOUR_STRONG_JWT_SECRET`, etc.) with your actual credentials and configurations. The old Cloudinary variables are deprecated and can be removed.
## 🔗 API Reference

This section provides a reference for the available API endpoints. All API routes are prefixed with `/api`. Authentication is required for most routes and is handled via JWT in cookies.

---

### Authentication (`/api/auth`)

#### 1. Sign Up
Registers a new user.

*   **URL:** `/signup`
*   **Method:** `POST`
*   **Body (JSON):**
    ```json
    {
      "fullName": "Your Name",
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
*   **Success Response (201 Created):**
    *   Sets an HTTP-only cookie with a JWT.
    *   Returns the created user object (without the password).
    ```json
    {
        "_id": "uniqueUserId",
        "fullName": "Your Name",
        "email": "user@example.com",
        "profilePic": "default_avatar_url",
        "bio": "",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input (e.g., email already exists, password too short, invalid username format).
    *   `500 Internal Server Error`: Server-side issue.

#### 2. Login
Logs in an existing user.

*   **URL:** `/login`
*   **Method:** `POST`
*   **Body (JSON):**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
*   **Success Response (200 OK):**
    *   Sets an HTTP-only cookie with a JWT.
    *   Returns the user object (without the password).
    ```json
    {
        "_id": "uniqueUserId",
        "fullName": "Your Name",
        "email": "user@example.com",
        "profilePic": "avatar_url",
        "bio": "User's bio",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid credentials (e.g., "Invalid email or password").
    *   `500 Internal Server Error`.

#### 3. Logout
Logs out the currently authenticated user.

*   **URL:** `/logout`
*   **Method:** `POST`
*   **Success Response (200 OK):**
    *   Clears the authentication cookie.
    *   Returns a success message.
    ```json
    {
      "message": "Logged out successfully"
    }
    ```
*   **Error Responses:**
    *   `500 Internal Server Error`.

#### 4. Check Authentication Status
Checks if the user is currently authenticated. (Protected Route)

*   **URL:** `/check`
*   **Method:** `GET`
*   **Authentication:** Required (JWT Cookie)
*   **Success Response (200 OK):**
    *   Returns the authenticated user object (without the password).
    ```json
    {
        "_id": "uniqueUserId",
        "fullName": "Your Name",
        "email": "user@example.com",
        "profilePic": "avatar_url",
        "bio": "User's bio",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized`: If not authenticated or token is invalid.
    *   `500 Internal Server Error`.

#### 5. Update User Profile
Updates the authenticated user's profile (fullName, bio, or profilePic). (Protected Route)

*   **URL:** `/update-profile`
*   **Method:** `PUT`
*   **Authentication:** Required (JWT Cookie)
*   **Body (JSON):** (Provide at least one field to update)
    ```json
    {
      "fullName": "New Full Name", // Optional
      "bio": "New user bio",        // Optional
      "profilePic": "base64ImageDataUrl" // Optional, for new picture
    }
    ```
*   **Success Response (200 OK):**
    *   Returns the updated user object.
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input (e.g., username validation failed).
    *   `401 Unauthorized`.
    *   `500 Internal Server Error`.

---

### Messages (`/api/messages`)

#### 1. Get Users for Sidebar
Retrieves a list of all users *except* the currently logged-in user. This is typically used to populate a sidebar or user list for starting new conversations. (Protected Route)

*   **URL:** `/users`
*   **Method:** `GET`
*   **Authentication:** Required (JWT Cookie)
*   **Success Response (200 OK):**
    *   Returns an array of user objects (without passwords).
    ```json
    [
      { "_id": "userId1", "fullName": "User One", "profilePic": "url_or_path1" },
      { "_id": "userId2", "fullName": "User Two", "profilePic": "url_or_path2" }
    ]
    ```
*   **Error Responses:**
    *   `401 Unauthorized`.
    *   `500 Internal Server Error`.

#### 2. Get Messages with a Specific User
Retrieves the message history between the authenticated user and another specified user. (Protected Route)

*   **URL:** `/:id`
*   **Method:** `GET`
*   **Authentication:** Required (JWT Cookie)
*   **URL Parameters:**
    *   `id` (string, **Required**): The `_id` of the other user in the conversation.
*   **Success Response (200 OK):**
    *   Returns an array of message objects, sorted by `createdAt` (oldest first).
    ```json
    [
      {
        "_id": "messageId",
        "senderId": "senderUserId",
        "receiverId": "receiverUserId",
        "text": "Hello there!",
        "image": "optional_image_url_if_any.jpg",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
      // ... more messages
    ]
    ```
*   **Error Responses:**
    *   `401 Unauthorized`.
    *   `500 Internal Server Error`.

#### 3. Send Message
Sends a new message (text and/or image) to a specified user. (Protected Route)

*   **URL:** `/send/:id`
*   **Method:** `POST`
*   **Authentication:** Required (JWT Cookie)
*   **URL Parameters:**
    *   `id` (string, **Required**): The `_id` of the recipient user.
*   **Body (JSON):**
    ```json
    {
      "text": "Your message text here", // Optional if image is provided
      "image": "base64ImageDataUrl"     // Optional if text is provided
    }
    ```
*   **Success Response (201 Created):**
    *   Returns the newly created message object.
    ```json
    {
        "_id": "newMessageId",
        "senderId": "authenticatedUserId",
        "receiverId": "recipientUserId",
        "text": "Your message text here",
        "image": "url_to_uploaded_image_if_any.jpg",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid input (e.g., no text or image, invalid image format, receiver ID missing).
    *   `401 Unauthorized`.
    *   `500 Internal Server Error` (e.g., S3 upload failure, database error).

---

### Users (`/api/users`)

#### 1. Search Users
Searches for users by their full name, excluding the currently authenticated user. (Protected Route)

*   **URL:** `/search`
*   **Method:** `GET`
*   **Authentication:** Required (JWT Cookie)
*   **Query Parameters:**
    *   `q` (string, **Required**): The search query string for the user's full name.
*   **Success Response (200 OK):**
    *   Returns an array of user objects matching the search query (selected fields: `fullName`, `profilePic`, `_id`).
    ```json
    [
      { "_id": "foundUserId1", "fullName": "Matching User One", "profilePic": "url1" },
      { "_id": "foundUserId2", "fullName": "Matching User Two", "profilePic": "url2" }
    ]
    ```
    *   Returns an empty array `[]` if no users match or if `q` is empty.
*   **Error Responses:**
    *   `401 Unauthorized`.
    *   `500 Internal Server Error`.

#### 2. Get Conversation Partners
Retrieves a list of users with whom the authenticated user has had conversations. (Protected Route)
*This endpoint seems to be defined in `user.routes.js` but its functionality might overlap or be similar to `/api/messages/users`.*

*   **URL:** `/contacts`
*   **Method:** `GET`
*   **Authentication:** Required (JWT Cookie)
*   **Success Response (200 OK):**
    *   Returns an array of user objects (partners) with selected fields (`fullName`, `profilePic`, `_id`).
    ```json
    [
      { "_id": "partnerId1", "fullName": "Partner One", "profilePic": "url1" },
      { "_id": "partnerId2", "fullName": "Partner Two", "profilePic": "url2" }
    ]
    ```
    *   Returns an empty array `[]` if no conversation partners are found.
*   **Error Responses:**
    *   `401 Unauthorized`.
    *   `500 Internal Server Error`.

---

**Note:** Error responses typically include a JSON body with an `error` or `message` field detailing the issue.
## 🚀 Tech Stack

### **Client:**
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=socket.io&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white) 
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### **Server:**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white) 
![Yandex Cloud](https://img.shields.io/badge/Yandex_Cloud-FFDB4D?style=for-the-badge&logo=yandex-cloud&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### **DevOps / Build:**
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) 
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

## ❓ FAQ

#### What is PingMe?
PingMe is a real-time web messenger application designed for instant communication. It allows users to exchange text messages and share images seamlessly.

#### What technologies are used to build PingMe?
PingMe is built with a modern tech stack:
*   **Frontend:** React, Vite, Tailwind CSS, Zustand, Socket.io Client
*   **Backend:** Node.js, Express.js, Socket.io, MongoDB (with Mongoose), JWT
*   **Storage:** Yandex.Cloud S3 for file and image storage

#### How do I set up the project locally?
    1.  Clone the repository.
    2.  Navigate to the `backend` directory and run `npm install`.
    3.  Create a `.env` file in the `backend` directory based on the `Environment Variables` section and fill in your credentials.
    4.  Navigate to the `frontend` directory and run `npm install`.
    5.  In separate terminals, run `npm run dev` (или ваш скрипт запуска) in both the `backend` and `frontend` directories.

#### Is there a live demo available?
Currently, a live demo is hosted on Render. You can access it here: *https://pingme-react-messanger.onrender.com*. Please note that a free tier on Render might cause the application to "sleep" if inactive, so the first load might be a bit slow.
## 💬 Feedback & Contact

We highly value your input and would love to hear your thoughts, suggestions, or any issues you might encounter while using PingMe!

You can reach out to us through the following channels:

*   **Gmail:** [prostopochta066@gmail.com](mailto:prostopochta066@gmail.com)
*   **Mail(ru):** [gelgaev.dev@mail.ru](mailto:gelgaev.dev@mail.ru)
*   **Telegram:** [@timaamn](https://t.me/timaamn)

We appreciate you taking the time to help us improve PingMe!
## 👨‍💻 Author

**Tamerlan (@blesswrld)**

🚀 Frontend Developer focused on creating responsive, fast, and beautiful web interfaces, primarily with React. I enjoy building interactive applications and constantly seek new challenges and opportunities for growth.

-   **GitHub:** [@blesswrld](https://www.github.com/blesswrld)
-   **Telegram:** [@timammn](https://t.me/timammn)

## 📜 License

Distributed under the MIT License. See `LICENSE.md` for more information.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)