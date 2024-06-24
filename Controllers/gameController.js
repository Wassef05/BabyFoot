const Game = require('../Models/gameModel');

const getGames = async (req, res) => {
  try {
    const games = await Game.getAllGames();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve games' });
  }
};

const createGame = async (req, res) => {
  const { name } = req.body;
  try {
    const newGame = await Game.createGame(name);
    const io = req.app.get('socketio');
    io.emit('gameCreated', newGame);
    res.json(newGame);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create game' });
  }
};

const finishGame = async (req, res) => {
  const { id } = req.params;
  try {
    const finishedGame = await Game.completeGame(id);
    const io = req.app.get('socketio');
    io.emit('gameFinished', finishedGame);
    res.json(finishedGame);
  } catch (err) {
    res.status(500).json({ error: 'Failed to finish game' });
  }
};

const deleteGame = async (req, res) => {
  const { id } = req.params;
  try {
    await Game.deleteGame(id);
    const io = req.app.get('socketio');
    io.emit('gameDeleted', { id });
    res.json({ success: true });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to delete game' });
    }
  }
};

module.exports = {
  getGames,
  createGame,
  finishGame,
  deleteGame,
};
