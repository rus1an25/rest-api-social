const webSocketsServerPort = 8000;
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require("helmet");
const webSocketServer = require('websocket').server;
const http = require('http');
const WebSocketAPI = require('./Components/Services/webSocketAPI');

const webSocket = new WebSocketAPI();
app.use(cors({
    "origin": "https://socia1.herokuapp.com",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true
}));

const websocketAPI = () => {
    const app = express();
    dotenv.config();

    app.use(express.json());
    app.use(helmet());

    //======================================================================================================
    // Spinning the http server and the websocket server.
    const server = http.createServer(app);
    server.listen(webSocketsServerPort, () => {
        console.log(`WebSocket Server is started on port:${webSocketsServerPort}`)
    });

    const wsServer = new webSocketServer({
        httpServer: server
    });

    // I'm maintaining all active connections in this object
    const usersOnline = {};

    const conversationsOnline = {};

    wsServer.on('request', function(request) {
        const connection = request.accept(null, 'http://localhost:3000');

        connection.on('message', async (message) => {
            let currentUserID = null;
            console.log('MESSAGE', message)
            if (message.type === 'utf8' && JSON.parse(message.utf8Data).type === 'CURRENT_USER_ID' && JSON.parse(message.utf8Data).userId !== null) {
                currentUserID = JSON.parse(message.utf8Data).userId;
                usersOnline[currentUserID] = connection;
                console.log(Object.getOwnPropertyNames(usersOnline))
                if (!conversationsOnline[currentUserID]) conversationsOnline[currentUserID] = null;
                let companions = await webSocket.getCompanions(currentUserID)
                usersOnline[currentUserID].send(JSON.stringify({
                    type: 'COMPANIONS',
                    companions
                }));
            } else if (message.type === 'utf8' && JSON.parse(message.utf8Data).type === 'GET_CONVERSATION_ID' && JSON.parse(message.utf8Data).companionId !== null) {
                currentUserID = JSON.parse(message.utf8Data).userId;
                let companionID = JSON.parse(message.utf8Data).companionId;
                const conversationId = await webSocket.getConversation(currentUserID, companionID);
                conversationsOnline[currentUserID] = JSON.parse(conversationId);
                const messagesByConversationId = await webSocket.getMessage(JSON.parse(conversationId));
                console.log(Object.getOwnPropertyNames(usersOnline))
                usersOnline[currentUserID].send(JSON.stringify({
                    type: 'CONVERSATION_ID',
                    conversationId,
                    messages: messagesByConversationId
                }));
            } else if (message.type === 'utf8' && JSON.parse(message.utf8Data).type === 'POST_MESSAGE' && JSON.parse(message.utf8Data).conversationId !== null) {
                let conversationId = JSON.parse(message.utf8Data).conversationId;
                let senderId = JSON.parse(message.utf8Data).senderId;
                let companionId = JSON.parse(message.utf8Data).companionId;
                let text = JSON.parse(message.utf8Data).text;
                const newMessage = await webSocket.createMessage(conversationId, senderId, text)
                usersOnline[senderId].send(JSON.stringify({
                    type: 'NEW_MESSAGE',
                    message: newMessage
                }));
                if (usersOnline[companionId] && conversationsOnline[companionId] === conversationId) {
                    usersOnline[companionId].send(JSON.stringify({
                        type: 'NEW_MESSAGE_COMPANION',
                        conversation: JSON.stringify(conversationId),
                        message: newMessage
                    }));
                }
            }
        })
    });
};

module.exports = websocketAPI;