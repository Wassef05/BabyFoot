document.addEventListener('DOMContentLoaded', () => {
  const createGameBtn = document.getElementById('createGameBtn');
  const newGameInput = document.getElementById('newGameInput');
  const gameList = document.getElementById('gameList');
  const unfinishedCount = document.getElementById('unfinishedCount');
  let ignoreNextGameCreatedEvent = false;

  const updateUnfinishedCount = () => {
    const unfinishedGames = document.querySelectorAll('#gameList li:not(.finished)').length;
    unfinishedCount.textContent = unfinishedGames;
  };

  const showAlert = (title, text, icon) => {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: 'OK'
    });
  };

  createGameBtn.addEventListener('click', () => {
    const gameName = newGameInput.value.trim();
    if (gameName === '') {
      showAlert('Erreur', 'Le nom de la partie ne peut pas être vide', 'error');
      return;
    }

    fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: gameName })
    })
    .then(response => response.json())
    .then(data => {
      if (data.id) {
        newGameInput.value = '';
        addGameToList(data);
        updateUnfinishedCount();
        showAlert('Succès', 'La partie a été ajoutée avec succès', 'success');
        ignoreNextGameCreatedEvent = true;  // Ignorer le prochain événement 'gameCreated'
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showAlert('Erreur', 'Impossible d\'ajouter la partie', 'error');
    });
  });

  const addGameToList = (game) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    li.dataset.id = game.id;
    if (game.status === 'completed') {
      li.classList.add('finished');
    }
    li.innerHTML = `
      <span>${game.name}</span>
      <div>
        <button class="finish-btn" onclick="finishGame(${game.id})">✓</button>
        <button class="delete-btn" onclick="deleteGame(${game.id})">✗</button>
        <div class="timer" data-id="${game.id}"></div>
        <div class="status">${game.status === 'in_progress' ? 'En cours' : 'Terminé'}</div>
      </div>
    `;
    gameList.appendChild(li);

    if (game.status === 'in_progress') {
      startTimer(li.querySelector('.timer'), 20, game.id); // 20 secondes pour l'exemple
    }
  };

  const startTimer = (element, duration, gameId) => {
    let time = duration;
    const statusElement = element.nextElementSibling; 
    const interval = setInterval(() => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      element.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      statusElement.textContent = 'En cours';
      if (--time < 0) {
        clearInterval(interval);
        finishGame(gameId);
        showAlert('Terminé', 'Le match est terminé', 'info');
        statusElement.textContent = 'Terminé';
      }
    }, 1000);
  };

  window.finishGame = (gameId) => {
    fetch(`/api/games/${gameId}`, {
      method: 'PUT'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'completed') {
        const li = document.querySelector(`#gameList li[data-id="${gameId}"]`);
        if (li) {
          li.classList.add('finished');
          li.querySelector('.status').textContent = 'Terminé'; // Mettre à jour le statut
          updateUnfinishedCount();
          showAlert('Succès', 'La partie a été terminée avec succès', 'success');
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showAlert('Erreur', 'Impossible de terminer la partie', 'error');
    });
  };

  window.deleteGame = (gameId) => {
    fetch(`/api/games/${gameId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const li = document.querySelector(`#gameList li[data-id="${gameId}"]`);
        if (li) {
          li.remove();
          updateUnfinishedCount();
          showAlert('Succès', 'La partie a été supprimée avec succès', 'success');
        } else {
          console.error(`Element with ID ${gameId} not found`);
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showAlert('Erreur', 'Impossible de supprimer la partie', 'error');
    });
  };

  // Fetch and display existing games on load
  fetch('/api/games')
  .then(response => response.json())
  .then(games => {
    games.forEach(addGameToList);
    updateUnfinishedCount();
  })
  .catch(error => {
    console.error('Error fetching games:', error);
    showAlert('Erreur', 'Impossible de récupérer les parties', 'error');
  });

  const socket = io();

  socket.on('gameCreated', (game) => {
    if (!ignoreNextGameCreatedEvent) {
      addGameToList(game);
      updateUnfinishedCount();
      showAlert('Info', 'Une nouvelle partie a été ajoutée', 'info');
    } else {
      ignoreNextGameCreatedEvent = false;
    }
  });

  socket.on('gameFinished', (game) => {
    const li = document.querySelector(`#gameList li[data-id="${game.id}"]`);
    if (li) {
      li.classList.add('finished');
      li.querySelector('.status').textContent = 'Terminé'; // Mettre à jour le statut
      updateUnfinishedCount();
      showAlert('Info', 'Une partie a été terminée', 'info');
    }
  });

  socket.on('gameDeleted', ({ id }) => {
    const li = document.querySelector(`#gameList li[data-id="${id}"]`);
    if (li) {
      li.remove();
      updateUnfinishedCount();
      showAlert('Info', 'Une partie a été supprimée', 'info');
    } else {
      console.error(`Element with ID ${id} not found`);
    }
  });

  //Les fonctionnalités de CHAT
  const joinRoomBtn = document.getElementById('joinRoomBtn');
  const nicknameInput = document.getElementById('nicknameInput');
  const roomIdInput = document.getElementById('roomIdInput');
  const chatContainer = document.getElementById('chatContainer');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const messagesList = document.getElementById('messagesList');
  let currentRoomId = null;
  let currentNickname = null;

  joinRoomBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    const roomId = roomIdInput.value.trim();

    if (!nickname || !roomId) {
      showAlert('Erreur', 'Nickname et Room ID sont requis', 'error');
      return;
    }

    currentRoomId = roomId;
    currentNickname = nickname;
    socket.emit('joinRoom', { roomId, nickname });
    chatContainer.classList.remove('d-none');

    const welcomeMessage = document.createElement('li');
    welcomeMessage.classList.add('list-group-item');
    welcomeMessage.textContent = `Bienvenue ${nickname} dans la salle ${roomId}`;
    messagesList.appendChild(welcomeMessage);
  });

  sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
      socket.emit('chatMessage', { roomId: currentRoomId, nickname: currentNickname, message, timestamp: new Date().toLocaleTimeString() });
      messageInput.value = '';
    }
  });

  socket.on('message', ({ nickname, message, timestamp }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerHTML = `<strong>${nickname} (${timestamp}):</strong> ${message}`;
    messagesList.appendChild(li);
  });
});
