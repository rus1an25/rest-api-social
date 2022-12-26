require('dotenv').config();
const fs = require("fs");
const express = require('express');
const http = require('http');
const {Server} = require("socket.io");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const authRouter = require('./Components/Routers/authRouter.js');
const usersRouter = require('./Components/Routers/usersRouter.js');
const postsRouter = require('./Components/Routers/postsRouter.js');
const profileRouter = require('./Components/Routers/profileRouter');
const conversationsRouter = require('./Components/Routers/conversationsRouter');
const errorMiddleware = require('./Components/middlewares/error-middleware.js');

const conversationsController = require('./Components/Controllers/conversationController');
const messageController = require('./Components/Controllers/messagesController');
const profileController = require('./Components/Controllers/profileController');
const conversationController = require('./Components/Controllers/conversationController');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: `${process.env.CLIENT_URL}`,
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const connections = {};

io.on("connection", (socket) => {
    socket.on("CURRENT_USER_ID", (userID) => {
        console.log('CONNECTION_userID', userID);
        if (!connections.hasOwnProperty(userID)) {
            connections[userID] = [socket.id];
        } else {
            connections[userID].push(socket.id);
        }
        const values = Object.keys(connections);
        socket.emit("GET_USERS_ONLINE", values);
    });

    socket.on("GET_COMPANIONS_LIST", async (userId) => {
        const companions = await conversationController.getCompanions(userId);
        socket.emit("GET_COMPANIONS_LIST_REQ", companions);
    });

    socket.on("GET_CONVERSATION", async (data) => {
        const conversation = await conversationsController.getConversation(data.userId, data.companionId);
        socket.emit("GET_CONVERSATION_REQ", conversation._id.toString());
    });

    socket.on("GET_MESSAGES", async (conversationId) => {
        console.log("GET_MESSAGES: ", conversationId)
        const messages = await messageController.getMessages(conversationId);
        socket.emit("GET_MESSAGES_REQ", messages);
    });

    socket.on("SEND_MESSAGE", async (data) => {
        const message = await messageController.createMessage(data);
        socket.emit("SEND_MESSAGE_REQ", message);
        if (connections[data.companionId] !== undefined && connections[data.companionId].length > 0) {
            connections[data.companionId].forEach(connection => io.to(connection).emit("SEND_MESSAGE_REQ", message))
        }
        console.log('SEND_MESSAGE_REQ: ', message)
    });

    socket.on('disconnect', async () => {
        let discConnect = null;
        for (let prop in connections) {
            if (connections[prop].includes(socket.id)) {
                await profileController.updateLastSeen(prop);
                discConnect = connections[prop];
                let newArr = connections[prop].filter(prop => prop !== socket.id);
                connections[prop] = newArr;
            }
            if (connections[prop].length === 0) delete connections[prop];

        }
        console.log('disconnected:', connections);
    });
});

const PORT = process.env.PORT || 5000;
app.use(cors({
    // "origin": `${process.env.CLIENT_URL}`,
    "origin": "http://localhost:3000",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true
}));

//middleware
//=========================================================================================
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('common'));
app.use(express.static(path.join(__dirname, 'images')));
app.use(fileUpload({}));
app.use(errorMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/conversations', conversationsRouter);

try {
    server.listen(PORT, async () => {
        await mongoose.connect(process.env.DB_MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Backend server is started in ${process.env.API_URL}`);
    });

} catch (e) {
    console.log(e)
}