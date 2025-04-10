# Chat Application

A real-time chat application built with **Next.js 15**, **Express**, **Socket.io**, and **NeonDB (PostgreSQL with Prisma ORM)**.

## Features
- **Real-time messaging** with WebSockets (Socket.io)
- **User authentication** (Clerk or custom auth)
- **Message persistence** using NeonDB and Prisma
- **Responsive UI** built with Tailwind CSS
- **Optimized database structure** for fast queries

## Technologies Used
### Frontend
- **Next.js 15** (React framework)
- **TypeScript** (Static typing)
- **Tailwind CSS** (Styling)
- **Socket.io-client** (WebSocket communication)
- **Axios** (HTTP requests)

### Backend
- **Node.js & Express** (REST API)
- **Socket.io** (Real-time WebSockets)
- **Prisma ORM** (Database management)
- **NeonDB (PostgreSQL)** (Cloud database)

## Setup Instructions
### 1. Clone the Repository
```sh
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Install Dependencies
#### Frontend
```sh
cd frontend
npm install
```
#### Backend
```sh
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in both `frontend` and `backend` directories and add:
#### **Frontend (`.env.local` in `frontend/`)**
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### **Backend (`.env` in `backend/`)**
```env
PORT=8000
DATABASE_URL=postgresql://user:password@your-neon-db-url/dbname
```

### 4. Start the Application
#### **Run the Backend**
```sh
cd backend
npm run dev
```
#### **Run the Frontend**
```sh
cd frontend
npm run dev
```

## Usage
- Open `http://localhost:3000` in your browser.
- Sign in and start chatting in real time!

## API Endpoints
### **User ID Fetching**
```http
POST /api/getId
```
**Request Body:** `{ "email": "user@example.com" }`
**Response:** `{ "id": "123" }`

### **Fetch Messages**
```http
POST /api/conversation
```
**Request Body:** `{ "to": "receiver@example.com", "from": "sender@example.com" }`

### **Send Message (WebSocket)**
```json
{
  "to": "receiver@example.com",
  "message": "Hello!",
  "from": "sender@example.com"
}
```

## Future Enhancements
- User authentication via JWT or OAuth
- Message read receipts
- Typing indicators
- Group chat support

## License
This project is licensed under the **MIT License**.

