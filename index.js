const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'home.html'));
});

app.get('/chat/:chatId', (req, res) => {
  const chatId = req.params.chatId;
  res.sendFile(path.join(__dirname, 'static', 'group.html'));
});

let connectedUsers = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  if (connectedUsers.length >= 2) {
    socket.emit('chat message', { sender: 'System', msg: 'Chat is full. Please try again later.' });
    socket.disconnect();
    return;
  }

  connectedUsers.push(socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    connectedUsers = connectedUsers.filter(user => user !== socket.id);
  });

  socket.on('chat message', async (msg) => {
    io.emit('chat message', msg);
 
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
