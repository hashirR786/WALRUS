# 🦭 Walrus - AI-Powered Productivity Hub

Walrus is a modern, full-stack MERN (MongoDB, Express, React, Node.js) task management assistant integrated with **Groq SDK** utilizing the state-of-the-art **Llama-3.3-70b-versatile** model to deliver real-time intelligent suggestions, priority insights, and interactive productivity coaching.

---

## 🚀 Key Features

* **🔐 JWT Authentication**: Secure, encrypted signup and sign-in flows using `bcryptjs` password hashing and token-based session persistence.
* **📂 Multi-Tenant Task Board**: Strict user-level database isolation. Add, delete, rename, search, and toggle tasks in real-time.
* **🧠 Groq AI Suggestions**: One-click analysis of active tasks to categorize workflows (Study, Career, Personal) and recommend missing steps or useful next objectives.
* **💬 Interactive AI Coach ("Ask Walrus")**: Ask questions directly to your AI coach (e.g. *"How can I prepare for my upcoming DBMS exam?"*). It automatically contextualizes answers based on your active task list.
* **📊 Analytics Dashboard**: Track active tasks, completion rate metrics, and category breakdowns.
* **🎨 Premium UI/UX**: Crafted CSS styling featuring glassmorphism design layouts, harmonious dark/light themes, animations, and responsive layouts.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Lucide Icons, Vanilla CSS Design System
* **Backend**: Node.js, Express.js, JSON Web Tokens (JWT)
* **Database**: MongoDB Atlas, Mongoose ODM
* **AI Service**: Groq SDK (`llama-3.3-70b-versatile`)

---

## 📁 Project Structure

```text
walrus/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js   # JWT Signup & Login handlers
│   │   └── taskController.js   # CRUD & AI Coach handlers
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protective router interceptor
│   ├── models/
│   │   ├── Task.js             # Task Mongoose schema (User ref)
│   │   └── User.js             # User Mongoose schema (Bcrypt pre-save)
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication route endpoints
│   │   └── taskRoutes.js       # Protected task route endpoints
│   ├── services/
│   │   └── groqService.js      # Groq SDK controller
│   ├── .env                    # Credentials configurations (git ignored)
│   ├── package.json            # Node backend packages configuration
│   └── server.js               # Express entrypoint
├── public/
│   └── walrus.jpeg             # App branding logo asset
├── src/
│   ├── components/
│   │   ├── Insights.jsx        # AI Priority & Ask Walrus coach panel
│   │   ├── Suggestions.jsx     # AI Recommended Tasks quick-add panel
│   │   ├── TaskInput.jsx       # Task form submit component
│   │   ├── TaskItem.jsx        # Checkboxes, inline edit, delete
│   │   └── TaskList.jsx        # Search filters & mapping lists
│   ├── pages/
│   │   ├── Auth.jsx            # Sign-in / Sign-up layout card
│   │   └── Dashboard.jsx       # Layout orchestrator & API fetcher
│   ├── App.jsx                 # Theme triggers & Toast notification shell
│   ├── index.css               # Design tokens, variables & animations
│   └── main.jsx                # React DOM render entry
├── index.html                  # HTML entry with customized favicon
├── package.json                # Frontend Vite package specifications
└── vite.config.js              # Vite compilers parameters
```

---

## ⚙️ Quick Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas free cloud cluster)
* [Groq API Key](https://console.groq.com/) (Get a free key from the Groq console)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/walrus.git
cd walrus
```

### Step 2: Configure Environment Variables
Create a `.env` file inside the `backend` folder:
```bash
# Navigate to backend
cd backend
touch .env
```
Add the following key-value pairs into `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<db_username>:<db_password>@yourcluster.mongodb.net/walrus?retryWrites=true&w=majority
GROQ_API_KEY=gsk_your_groq_api_key_goes_here
JWT_SECRET=your_super_secret_jwt_encryption_key
```

### Step 3: Install Dependencies
Run dependency installs in both root and backend folders:

**For Backend:**
```bash
cd backend
npm install
```

**For Frontend (Root):**
```bash
# Return to root directory
cd ..
npm install
```

---

## ⚡ Running the Application

### 1. Launch Backend Server
In your terminal, navigate to the `backend` folder and start the dev server (running on port `5000`):
```bash
cd backend
npm run dev
```

### 2. Launch Frontend Application
Open a separate terminal window at the project root folder and start Vite (running on port `5173`):
```bash
npm run dev
```

Visit **`http://localhost:5173/`** in your browser to experience **Walrus**!

---

## 📄 License
This project is licensed under the MIT License.
