const express = require('express');
const dbconnect = require('./config/db');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Comment = require('./models/Comment');

dotenv.config();
dbconnect();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`User joined project room: ${projectId}`);
  });

  socket.on('send_message', async (data) => {
    // data should contain { projectId, userId, message }
    try {
      const newComment = await Comment.create({
        projectId: data.projectId,
        userId: data.userId,
        message: data.message
      });
      const populatedComment = await newComment.populate('userId', 'name email');
      
      io.to(data.projectId).emit('receive_message', populatedComment);
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cookieParser());

const authRoute = require('./routes/authRoute');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

app.use("/api/auth", authRoute);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Serve React build if applicable
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server Starting on port ${PORT} .....`);
});
