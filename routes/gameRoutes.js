const express = require('express');
const router = express.Router();
const gameController = require('../Controllers/gameController');

router.get('/games', gameController.getGames);
router.post('/games', gameController.createGame);
router.put('/games/:id', gameController.finishGame);
router.delete('/games/:id', gameController.deleteGame);

module.exports = router;
