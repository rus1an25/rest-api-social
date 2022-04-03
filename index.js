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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://socia1.herokuapp.com",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const connections = {};

io.on("connection", (socket) => {
    socket.on("CURRENT_USER_ID", (userID) => {
        if (!connections.hasOwnProperty(userID)) {
            connections[userID] = [socket.id];
        } else {
            connections[userID].push(socket.id);
        }
        socket.emit("SOCKET_ID", socket.id);
    });

    socket.on("GET_CONVERSATION_REQ", async (data) => {
        const conversation = await conversationsController.getConversation(data.userId, data.companionId);
        socket.emit("GET_CONVERSATION_RES", conversation._id);
    });

    socket.on("GET_MESSAGES_REQ", async (data) => {
        const messages = await messageController.getMessages(data);
        socket.emit("GET_MESSAGES_RES", messages);
    });

    socket.on("SEND_MESSAGE_REQ", async (data) => {
        const message = await messageController.createMessage(data);
        socket.emit("SEND_MESSAGE_RES", message);
        if (connections[data.companionId] !== undefined && connections[data.companionId].length > 0) {
            connections[data.companionId].forEach(connection => io.to(connection).emit("SEND_MESSAGE_RES", message))
        }
    });



    socket.on('disconnect', () => {
        for (let prop in connections) {
            if (connections[prop].includes(socket.id)) {
                let newArr = connections[prop].filter(prop => prop !== socket.id);
                connections[prop] = newArr;
            }
            console.log(connections[prop])
        }
        console.log('disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
app.use(cors({
    "origin": "https://socia1.herokuapp.com",
    // "origin": "http://localhost:3000",
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