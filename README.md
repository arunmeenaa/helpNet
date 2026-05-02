# HelpNet-
 Community Support PlatformHelpNet is a real-time, neighborhood-based platform designed to foster community support within apartment complexes. It allows residents to post requests for help, offer assistance, and communicate securely in real-time.🚀


# Key Features
 - **Community Isolation:** Users are grouped by their apartmentId, ensuring requests and messages are only visible to neighbors in the same building.
 Real-Time Messaging: Built with Socket.io for instant chat updates, unread message badges, and admin notifications.
 - **Request & Offer Management:** Residents can post "Requests" (needing help) or "Offers"      (providing help) with status tracking (Open/Resolved).
 - **Admin Dashboard:** Dedicated tools for apartment administrators to approve new residents or remove users from the community.
 - **Secure Authentication:** Uses Passport.js and JWT for secure user sessions and protected API routes.


## 🛠️ Tech Stack

 *Frontend*
 React.js (Vite)
 Socket.io-client (Real-time events)
 Tailwind CSS (Styling)
 React Router (Navigation)

 *Backend*
 Node.js & Express
 Socket.io (WebSocket server)
 Passport.js (Auth)

 *Database*
 MongoDB with Mongoose ODM

 *Security*
 Passport.js, JWT Authentication, bcrypt



## ⚙️ Installation & Setup

 1. Clone the repository
 ```bash
 git clone https://github.com/arunmeenaa/helpNet.git
 cd help-net
 ```

 2. *Backend Setup*
 - Navigate to the server directory: helpnet-backend
 - Install dependencies: npm install
 - Create a `.env` file in the root of the server folder:
 ```bash
 PORT=5000
 MONGO_URI=your_mongodb_connection_string
 JWT_SECRET=your_super_secret_key
 ```
Start the server: `npm run dev`


3. *Frontend Setup*
- Navigate to the client directory: helpnet-frontend
- Install dependencies: `npm install`
- Create a `.env` file in the root of the client folder:
- [VITE_API_URL=http://localhost:5000]
- Start the development server: npm run dev



## 📡 API Endpoints (Quick Reference)

*Authentication*
- POST /api/auth/register - Create a new account.
- POST /api/auth/login - Authenticate user and get token.

*Messages*
- GET /api/messages/unread-count - Get count of new messages.
- POST /api/messages/send - Send a message (emits socket event).
- GET /api/messages/conversation/:userId - Retrieve chat history with a specific neighbor.
- PATCH /api/messages/:id/read - Mark a message as seen.

*Community*
- GET /api/requests - List all help requests in your apartment.
- PATCH /api/requests/:id/status - Mark a request as resolved.
- PATCH /api/offers/:id/status - Mark an offer as resolved.



## 🔌WebSocket Events:

Event Name                 Direction             Description
join_room              Client -> Server      Joins a private room based on userId.
receive_message        Server -> Client      Delivers a new message to the recipient's UI.
approval_confirmed     Server -> Client      Notifies user they have been approved by an admin.
user_removed           Server -> Client      Forces a logout/status update if an admin removes a user.