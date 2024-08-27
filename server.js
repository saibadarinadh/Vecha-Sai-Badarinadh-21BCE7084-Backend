const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors'); // Import cors
const gameLogic = require('./gameLogic');

const app = express();
app.use(cors()); // Enable CORS for all origins

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameState = gameLogic.initializeGame();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const { event, data } = JSON.parse(message);
        console.log('Received event:', event);
        console.log('Received data:', data);

        if (event === 'playerMove') {
            const result = gameLogic.handlePlayerMove(gameState, data);
            console.log('Move result:', result);

            if (result.valid) {
                gameState = result.updatedState;
                broadcastGameState();
                if (result.gameOver) {
                    broadcastGameOver(result.winner);
                }
            } else {
                ws.send(JSON.stringify({ event: 'invalidMove', message: result.message }));
            }
        }

        if (event === 'resetGame') {
            gameState = gameLogic.initializeGame(); // Reinitialize the game state
            broadcastGameState(); // Broadcast the new game state to all clients
        }

        if (event === 'requestGameState') {
            ws.send(JSON.stringify({ event: 'gameStateUpdate', data: gameState }));
        }
    });

    ws.send(JSON.stringify({ event: 'gameStateUpdate', data: gameState }));
});

function broadcastGameState() {
    console.log('Broadcasting game state:', gameState);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event: 'gameStateUpdate', data: gameState }));
        }
    });
}

function broadcastGameOver(winner) {
    console.log('Broadcasting game over:', winner);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event: 'gameOver', winner }));
        }
    });
}

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
