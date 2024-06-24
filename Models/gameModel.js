const pool = require('../config/db');

const getAllGames = async () => {
  const result = await pool.query('SELECT * FROM game');
  return result.rows;
};

const createGame = async ( name) => {
  const result = await pool.query('INSERT INTO game (status, name) VALUES ($1, $2) RETURNING *', ['in_progress', name]);
  console.log(result);
  return result.rows[0];
};

const deleteGame = async (id) => {
  // const {  } = req.params;
  const result = await pool.query('DELETE FROM game WHERE id=$1 RETURNING *', [id]);
  return result.rowCount;
};

const completeGame = async (id) => {
  const result = await pool.query('UPDATE game SET status = $1 WHERE id=$2 RETURNING *', ['completed', id]);
  return result.rows[0];
};

module.exports = {
  getAllGames,
  createGame,
  deleteGame,
  completeGame,
};
