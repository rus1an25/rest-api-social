// const webSocketsServerPort = 8000;
// const express = require('express');
// const dotenv = require('dotenv');
// const helmet = require("helmet");
// const webSocketServer = require('websocket').server;
// const http = require('http');
// const WebSocketAPI = require('./Components/Services/webSocketAPI');
//
// const webSocket = new WebSocketAPI();
//
// const websocket = () => {
//     const app = express();
//     dotenv.config();
//
//     app.use(express.json());
//     app.use(helmet());
//
//     // Spinning the http server and the websocket server.
//     //======================================================================================================
//     try {
//         const server = http.createServer(app);
//         server.listen(webSocketsServerPort, () => {
//             console.log(`WebSocket Server is started on port:${webSocketsServerPort}`)
//         });
//
//         const wsServer = new webSocketServer({
//             httpServer: server
//         });
//
//         // I'm maintaining all active connections in this object
//         const usersOnline = {};
//
//         const conversationsOnline = {};
//
//         wsServer.on('request', function(request) {
//             const connection = request.accept(null, process.env.CLIENT_URL);
//
//             connection.on('message', async (message) => {
//                 let currentUserID = null;
//                 console.log('MESSAGE', message)
//                 if (message.type === 'utf8' && JSON.parse(message.utf8Data).type === 'CURRENT_USER_ID' && JSON.parse(message.utf8Data).userId !== null) {
//                     currentUserID = JSON.parse(message.utf8Data).userId;
//                     usersOnline[currentUserID] = connection;
//                     console.log(Object.getOwnPropertyNames(usersOnline))
//                     if (!conversationsOnline[currentUserID]) conversationsOnline[currentUserID] = null;
//                     let companions = await webSocket.getCompanions(currentUserID)
//                     usersOnline[currentUserID].send(JSON.stringify({
//                         type: 'COMPANIONS',
//                         companions
//                     }));
//                 } else if (message.type === 'utf8' && JSON.parse(message.utf8Data).type === 'GET_CONVERSATION_ID' && JSON.parse(message.utf8Data).companionId !== null) {
//                     currentUserID = JSON.parse(message.utf8Data).userId;
//                     let companionID = JSON.parse(message.utf8Data).companionId;
//                     const conversationId = await webSocket.getConversation(currentUserID, companionID);
//                     conversationsOnline[currentUserID] = JSON.parse(conversationId);
//                     const messagesByConversationId = await webSocket.getMessage(JSON.parse(conversationId));
//                     console.log(Object.getOwnPropertyNames(usersOnline))
//                     usersOnline[currentUserID].send(JSON.stringify({
//                         type: 'CONVERSATION_ID',
//                         conversationId,
//                         messages: messagesByConversationId
//                     }));
//                 } else if (message.type === 'utf8' && JSON.parse(message.utf8Data).type === 'POST_MESSAGE' && JSON.parse(message.utf8Data).conversationId !== null) {
//                     let conversationId = JSON.parse(message.utf8Data).conversationId;
//                     let senderId = JSON.parse(message.utf8Data).senderId;
//                     let companionId = JSON.parse(message.utf8Data).companionId;
//                     let text = JSON.parse(message.utf8Data).text;
//                     const newMessage = await webSocket.createMessage(conversationId, senderId, text)
//                     usersOnline[senderId].send(JSON.stringify({
//                         type: 'NEW_MESSAGE',
//                         message: newMessage
//                     }));
//                     if (usersOnline[companionId] && conversationsOnline[companionId] === conversationId) {
//                         usersOnline[companionId].send(JSON.stringify({
//                             type: 'NEW_MESSAGE_COMPANION',
//                             conversation: JSON.stringify(conversationId),
//                             message: newMessage
//                         }));
//                     }
//                 }
//             })
//         })
//     } catch (e) {
//         console.log(e)
//     }
// };
//
// module.exports = websocket;


const websocket = () => {
require('dotenv').config();
const express = require('express');
const path = require('path');
const { Server } = require('ws');

// const PORT = process.env.PORT || 4000;
    const webSocketsServerPort = 8000;
    const HOST = process.env.HOST || `http://localhost:${webSocketsServerPort}`;

const app = express();

const server = app
    .listen(webSocketsServerPort, () => console.log(`Listening on ${HOST}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
    wss.clients.forEach((client) => {
        client.send(new Date().toTimeString());
    });
}, 1000);}

module.exports = websocket;