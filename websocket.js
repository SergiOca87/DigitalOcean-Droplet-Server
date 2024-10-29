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

// On Signal Interrupt
process.on('SIGINT', () => {
    //Close all websocket connections
    wss.clients.forEach((client) => {
        client.close();
    });
    // Close the server and the db
    server.close(() => {
        shutDownDb();
    })
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

    db.run(`
        INSERT INTO visitors VALUES (count, time)
        VALUES (${numClients}, datetime('now'))
    `);

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

// Begin Database
const sqlite = require('sqlite3');

// This would save to a db file:
// const db = new sqlite.Database('./database.db');

// This would create a new in-memory db:
const db = new sqlite.Database(':memory:');

// Initialize the db before anything so that we cnanot query or write tot ables that do not exist
db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    })
}

function shutDownDb() {
    getCounts();
    console.log('Shutting down db');
    db.close();
}