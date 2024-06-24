const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const gameRoutes = require('./routes/gameRoutes');
const pool = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static('public'));

app.use('/api', gameRoutes);

app.post('/game', async (req, res) => {
  const createTableQuery = `
    CREATE TABLE game (
      id SERIAL PRIMARY KEY,
      status VARCHAR(255),
      name VARCHAR(255)
    );
  `;

  try {
    await pool.query(createTableQuery);
    res.send('Table created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating table');
  }
});

// Test de la connexion à la base de données
pool.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', ({ roomId, nickname }) => {
    socket.join(roomId);
    const message = {
      nickname: 'System',
      message: `${nickname} a rejoint la salle`,
      timestamp: new Date().toLocaleTimeString()
    };
    socket.to(roomId).emit('message', message);
  });

  socket.on('chatMessage', ({ roomId, nickname, message, timestamp }) => {
    io.to(roomId).emit('message', { nickname, message, timestamp });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.set('socketio', io);

module.exports = { io };
