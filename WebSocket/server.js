const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');

  clients.push(ws);

    ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // Broadcast the message to all other clients
    clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
        }
    });
    });

    ws.on('close', function close() {
    console.log('A client disconnected!');
    // Remove the client from the list of connected clients
    clients = clients.filter(client => client !== ws);
    }
    );
});

let clients = [];

console.log('WebSocket server is running on ws://localhost:8080');