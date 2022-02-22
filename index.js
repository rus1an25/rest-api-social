require('dotenv').config();
const express = require('express');
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
const messagesRouter = require('./Components/Routers/messagesRouter');
const conversationsRouter = require('./Components/Routers/conversationsRouter');
const websocketAPI = require('./websocket');
const errorMiddleware = require('./Components/middlewares/error-middleware.js');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({
    "origin": "https://radiant-crag-34053.herokuapp.com",
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
// app.use('/api/messages', messagesRouter);

try {
    app.listen(PORT, async () => {
        await mongoose.connect(process.env.DB_MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`Backend server is started in http://localhost:${PORT}`)
        websocketAPI();
    });
} catch (e) {
    console.log(e)
}