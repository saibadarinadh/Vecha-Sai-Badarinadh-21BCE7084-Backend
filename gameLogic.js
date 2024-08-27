// gameLogic.js

function initializeGame() {
    const board = Array(5).fill().map(() => Array(5).fill(null));
    const players = {
        A: {
            characters: [
                { name: 'A-P1', position: { x: 0, y: 0 }, type: 'Pawn' },
                { name: 'A-P2', position: { x: 1, y: 0 }, type: 'Pawn' },
                { name: 'A-H1', position: { x: 2, y: 0 }, type: 'Hero1' },
                { name: 'A-H2', position: { x: 3, y: 0 }, type: 'Hero2' },
                { name: 'A-P3', position: { x: 4, y: 0 }, type: 'Pawn' }
            ]
        },
        B: {
            characters: [
                { name: 'B-P1', position: { x: 0, y: 4 }, type: 'Pawn' },
                { name: 'B-P2', position: { x: 1, y: 4 }, type: 'Pawn' },
                { name: 'B-H1', position: { x: 2, y: 4 }, type: 'Hero1' },
                { name: 'B-H2', position: { x: 3, y: 4 }, type: 'Hero2' },
                { name: 'B-P3', position: { x: 4, y: 4 }, type: 'Pawn' }
            ]
        }
    };

    // Place Player A's characters on the board
    players.A.characters.forEach(c => board[c.position.y][c.position.x] = c);

    // Place Player B's characters on the board
    players.B.characters.forEach(c => board[c.position.y][c.position.x] = c);

    return {
        board,
        players,
        currentPlayer: 'A',
        gameOver: false,
    };
}


function handlePlayerMove(gameState, move) {
    const { character, direction } = move;
    const player = gameState.currentPlayer;

    const currentCharacter = gameState.players[player].characters.find(c => c.name === character);

    if (!currentCharacter) {
        return { valid: false, updatedState: gameState, message: `Character ${character} not found.` };
    }

    const newPosition = getNewPosition(currentCharacter, direction, player);

    if (!newPosition || !isValidPosition(newPosition)) {
        return { valid: false, updatedState: gameState, message: `Invalid move for ${character}.` };
    }

    const combatResult = handleCombat(gameState, currentCharacter, newPosition);

    if (combatResult.gameOver) {
        return {
            valid: true,
            updatedState: combatResult.updatedState,
            gameOver: true,
            winner: gameState.currentPlayer,
            message: `${gameState.currentPlayer} wins!`
            
            
        };
        initializeGame()
    }

    gameState.board[currentCharacter.position.y][currentCharacter.position.x] = null;
    currentCharacter.position = newPosition;
    gameState.board[newPosition.y][newPosition.x] = currentCharacter;

    gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';

    return {
        valid: true,
        updatedState: gameState,
        gameOver: false,
        winner: null,
        message: null
    };
}

// Calculate the new position based on the direction and character type
function getNewPosition(character, direction, player) {
    let { x, y } = character.position;

    if (character.type === 'Pawn') {
        // Restrict movements for Pawns (P1, P2, P3)
        if (['F', 'B', 'L', 'R'].includes(direction)) {
            if (player === 'B') {
                switch (direction) {
                    case 'F': y -= 1; break; // Forward
                    case 'B': y += 1; break; // Backward
                    case 'L': x -= 1; break; // Left
                    case 'R': x += 1; break; // Right
                }
            } else if (player === 'A') {
                switch (direction) {
                    case 'F': y += 1; break; // Forward
                    case 'B': y -= 1; break; // Backward
                    case 'L': x += 1; break; // Right (flipped from B's Left)
                    case 'R': x -= 1; break; // Left (flipped from B's Right)
                }
            }
        } else {
            // Invalid direction for Pawns, return null
            return null;
        }
    } else if (character.type === 'Hero1') {
        // Restrict movements for Hero1
        if (['F', 'B', 'L', 'R'].includes(direction)) {
            if (player === 'B') {
                switch (direction) {
                    case 'F': y -= 2; break; // Forward
                    case 'B': y += 2; break; // Backward
                    case 'L': x -= 2; break; // Left
                    case 'R': x += 2; break; // Right
                }
            } else if (player === 'A') {
                switch (direction) {
                    case 'F': y += 2; break; // Forward
                    case 'B': y -= 2; break; // Backward
                    case 'L': x += 2; break; // Right (flipped from B's Left)
                    case 'R': x -= 2; break; // Left (flipped from B's Right)
                }
            }
        } else {
            // Invalid direction for Hero1, return null
            return null;
        }
    } else if (character.type === 'Hero2') {
        // Restrict movements for Hero2
        if (['FL', 'FR', 'BL', 'BR'].includes(direction)) {
            if (player === 'B') {
                switch (direction) {
                    case 'FL': x -= 2; y -= 2; break; // Forward-Left
                    case 'FR': x += 2; y -= 2; break; // Forward-Right
                    case 'BL': x -= 2; y += 2; break; // Backward-Left
                    case 'BR': x += 2; y += 2; break; // Backward-Right
                }
            } else if (player === 'A') {
                switch (direction) {
                    case 'FL': x += 2; y += 2; break; // Backward-Right (flipped from B's Forward-Left)
                    case 'FR': x -= 2; y += 2; break; // Backward-Left (flipped from B's Forward-Right)
                    case 'BL': x += 2; y -= 2; break; // Forward-Right (flipped from B's Backward-Left)
                    case 'BR': x -= 2; y -= 2; break; // Forward-Left (flipped from B's Backward-Right)
                }
            }
        } else {
            // Invalid direction for Hero2, return null
            return null;
        }
    }

    return { x, y };
}




// Check if the new position is valid (within the board boundaries)
function isValidPosition(position) {
    return position.x >= 0 && position.x < 5 && position.y >= 0 && position.y < 5;
}

function handleCombat(gameState, character, newPosition) {
    const opponent = Object.keys(gameState.players).find(p => p !== gameState.currentPlayer);
    const opponentCharacter = gameState.players[opponent].characters.find(c => c.position.x === newPosition.x && c.position.y === newPosition.y);

    if (opponentCharacter) {
        gameState.board[newPosition.y][newPosition.x] = null;
        gameState.players[opponent].characters = gameState.players[opponent].characters.filter(c => c !== opponentCharacter);

        if (gameState.players[opponent].characters.length === 0) {
            return { gameOver: true, updatedState: gameState };
        }
    }

    return { gameOver: false, updatedState: gameState };
}

module.exports = {
    initializeGame,
    handlePlayerMove,
};
