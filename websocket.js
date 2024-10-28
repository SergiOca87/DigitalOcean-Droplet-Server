const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, function () {
    console.log('Server listening on port 3000');
});

// Begin Websocket
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server });

// Web Socket listener
wss.on('connection', function (ws) {
    const numClients = wss.clients.size;
    console.log('clients connected', numClients);

    wss.broadcast(`Current Visitors: ${numClients}`);

    // Web Socket state
    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome!');
    }

    ws.on('close', function close() {
        wss.broadcast(`Current Visitors: ${numClients}`);
        console.log('Client Disconnected');
    })
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};