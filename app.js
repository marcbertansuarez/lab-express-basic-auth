// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config');

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

const app = express();

const session = require('express-session');
const MongoStore = require('connect-mongo');

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

// default value for title local
const projectName = 'lab-express-basic-auth';
const capitalized = string => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)}- Generated with Ironlauncher`;

//Session
app.set('trust proxy', 1);
app.use(
    session({
        name: 'auth-app',
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 2592000000
        },
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        })
    })
)

// 👇 Start handling routes here
const index = require('./routes/index');
app.use('/', index);

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const mainRouter = require('./routes/main');
app.use('/main', mainRouter);

const privateRouter = require('./routes/private');
app.use('/private', privateRouter);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;

