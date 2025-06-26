let gameStatusDiv = document.getElementById("gameStatus");
let restartBtn = document.getElementById("restart");
let currentPlayer = "X";
let gameCount = 0;
let gameMode = "";
let player1Name = "Player 1";
let player2Name = "Player 2";

// handles game mode selection
function selectMode(mode) {
  gameMode = mode;
  document.getElementById("modeSelector").style.display = "none";
  if (mode === "ai") {
    document.getElementById("introMessage").style.display = "block";
  } else {
    document.getElementById("nameInputModal").style.display = "block";
  }
}

// closes CHITTI intro modal and starts game
function closeIntro() {
  document.getElementById("introMessage").style.display = "none";
  startGame();
}

// submits the names entered by players, or uses default names
function submitNames(event) {
  event.preventDefault();
  const p1 = document.getElementById("player1Input").value.trim();
  const p2 = document.getElementById("player2Input").value.trim();
  player1Name = p1 || "Player 1 (X)";
  player2Name = p2 || "Player 2 (O)";
  document.getElementById("nameInputModal").style.display = "none";
  startGame();
}

// allow pressing Enter to start game when modal is visible and inputs are not focused
document.addEventListener("keydown", function (event) {
  const modal = document.getElementById("nameInputModal");
  if (modal.style.display === "block" && event.key === "Enter") {
    const activeElement = document.activeElement;
    if (activeElement.tagName !== "INPUT" && activeElement.tagName !== "TEXTAREA") {
      submitNames(new Event("submit"));
    }
  }
});

// auto-select full text on input focus
["player1Input", "player2Input"].forEach(id => {
  document.getElementById(id).addEventListener("focus", function () {
    this.select();
  });
});


// restart game button
restartBtn.addEventListener("click", function () {
  gameStatusDiv.style.display = "none";
  startGame();
});

// resets game board and starts new round
function startGame() {
  setNewPattern([["", "", ""], ["", "", ""], ["", "", ""]]);
  gameCount++;
  currentPlayer = gameCount % 2 === 1 ? "X" : "O";
  setTurnStatus(currentPlayer);
  if (gameMode === "ai" && currentPlayer === "X") {
    setTimeout(machineMove, 400);
  }
}

// updates status bar based on current player turn
function setTurnStatus(player) {
  const statusDiv = document.getElementById("startingStatus");
  if (gameMode === "ai") {
    statusDiv.innerHTML = player === "X" ? "🤖 CHITTI's TURN" : "👨‍🔬 Dr. Vaseegaran's TURN";
    statusDiv.className = player === "X" ? "machine-turn" : "human-turn";
  } else {
    const playerName = player === "X" ? player1Name : player2Name;
    statusDiv.innerHTML = `🎮 ${playerName}'s TURN (${player})`;
    statusDiv.className = player === "X" ? "player-x-turn" : "player-o-turn";
  }
}

// returns current board pattern as 2D array
function getCurrentPattern() {
  let pattern = [["", "", ""], ["", "", ""], ["", "", ""]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      pattern[i][j] = document.getElementById(`row${i + 1}col${j + 1}`).innerText;
    }
  }
  return pattern;
}

// sets board state using provided 2D array pattern
function setNewPattern(pattern) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      document.getElementById(`row${i + 1}col${j + 1}`).textContent = pattern[i][j];
    }
  }
}

// add cell click handlers
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    document.getElementById(`row${i}col${j}`).addEventListener("click", function (e) {
      if (e.target.textContent === "" && (gameMode === "human" || currentPlayer === "O")) {
        e.target.textContent = currentPlayer;
        let board = getCurrentPattern();
        if (checkWin(board, currentPlayer)) {
          endGame(currentPlayer);
        } else if (checkDraw(board)) {
          endGame("tie");
        } else {
          currentPlayer = currentPlayer === "X" ? "O" : "X";
          setTurnStatus(currentPlayer);
          if (gameMode === "ai" && currentPlayer === "X") {
            setTimeout(machineMove, 400);
          }
        }
      }
    });
  }
}

// checks win condition for a given player
function checkWin(p, player) {
  for (let i = 0; i < 3; i++) {
    if (p[i][0] === player && p[i][1] === player && p[i][2] === player) return true;
    if (p[0][i] === player && p[1][i] === player && p[2][i] === player) return true;
  }
  if (p[0][0] === player && p[1][1] === player && p[2][2] === player) return true;
  if (p[0][2] === player && p[1][1] === player && p[2][0] === player) return true;
  return false;
}

// checks if the game is draw
function checkDraw(p) {
  return p.flat().every(cell => cell !== "");
}

// makes optimal AI move using Minimax with alpha-beta pruning
function machineMove() {
  let pattern = getCurrentPattern();
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!pattern[i][j]) {
        pattern[i][j] = "X";
        let score = minimax(pattern, 0, false, -Infinity, Infinity);
        pattern[i][j] = "";
        if (score > bestScore) {
          bestScore = score;
          move = [i, j];
        }
      }
    }
  }

  if (move) {
    document.getElementById(`row${move[0] + 1}col${move[1] + 1}`).textContent = "X";
  }

  setTimeout(() => {
    let newPattern = getCurrentPattern();
    if (checkWin(newPattern, "X")) {
      endGame("X");
    } else if (checkDraw(newPattern)) {
      endGame("tie");
    } else {
      currentPlayer = "O";
      setTurnStatus(currentPlayer);
    }
  }, 150);
}

// Minimax algorithm with alpha-beta pruning to compute AI move
function minimax(board, depth, isMaximizing, alpha, beta) {
  if (checkWin(board, "X")) return 10 - depth;
  if (checkWin(board, "O")) return depth - 10;
  if (checkDraw(board)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!board[i][j]) {
          board[i][j] = "X";
          let eval = minimax(board, depth + 1, false, alpha, beta);
          board[i][j] = "";
          maxEval = Math.max(maxEval, eval);
          alpha = Math.max(alpha, eval);
          if (beta <= alpha) return maxEval;
        }
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!board[i][j]) {
          board[i][j] = "O";
          let eval = minimax(board, depth + 1, true, alpha, beta);
          board[i][j] = "";
          minEval = Math.min(minEval, eval);
          beta = Math.min(beta, eval);
          if (beta <= alpha) return minEval;
        }
      }
    }
    return minEval;
  }
}

// displays end game result
function endGame(winner) {
  let message = "";
  if (gameMode === "ai") {
    if (winner === "X") {
      message = "👎<br>You Lost!<br>Did you forget CHITTI was powered by 1 TB of logic?<br>Try again, human!";
    } else if (winner === "O") {
      message = "👍<br>You win!<br>CHITTI is rebooting in shame...<br>Give me a patch update, please!";
    } else {
      message = "🤝<br>It's a tie!<br>No one got Sana this time.";
    }
  } else {
    if (winner === "X") {
      message = `🏆 ${player1Name} wins!`;
    } else if (winner === "O") {
      message = `🏆 ${player2Name} wins!`;
    } else {
      message = "🤝 It's a tie!";
    }
  }

  document.getElementById("status").innerHTML = message;
  gameStatusDiv.style.display = "block";
}
