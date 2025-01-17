const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/User.model');

// GET route
// Sign up view
router.get('/signup', (req, res, next) => {
    res.render('auth/signup');
});

//POST route
//User inputs sign up
router.post('/signup', async (req, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) {
        res.render('auth/signup', { error: 'All fields are necessary!' });
        return;
    }
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if(!regex.test(password)) {
        res.render('auth/signup', { error: 'Password needs to contain at least 6 characters, one number, one lowercase and one uppercase letter.' });
        return;
    }
    try {
        const userDB = await User.findOne({ username: username });
        if(userDB) {
            res.render('auth/signup', { error: 'Username already exists. Please try another one' })
            return;
        } else {
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = await User.create({ username, hashedPassword });
            res.render('auth/profile', newUser);
        }
    } catch (error) {
        next(error);
    }
})

//GET route
// Log in view
router.get('/login', (req, res, next) => {
    res.render('auth/login');
})

//POST route
//User inputs log in
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if(!username || !password) {
        res.render('auth/login', { error: 'Introduce username and password to log in'});
        return;
    }
    try {
        const userDB = await User.findOne({username: username})
        if(!userDB) {
            res.render('auth/login', { error: `There are no users by ${username}`});
            return;
        } else {
            const passwordMatch = await bcrypt.compare(password, userDB.hashedPassword);
            if(passwordMatch) {
                req.session.currentUser = userDB;
                res.render('auth/profile', userDB);
            } else {
                res.render('auth/login', { error: 'Unable to authenticate user' });
                return;
            }
        }
    } catch (error) {
        next(error)
    }

})

module.exports = router;