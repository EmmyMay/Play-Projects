const app = require('express').Router();
const passport = require('passport');
const User = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/main');


app.post('/register', (req, res) => {

    if (!req.body.email || !req.body.password) {
        res.json({
            success: false,
            message: 'Please enter an email and password to register.'
        })
    } else {
        var newUser = new User({
            email: req.body.email,
            password: req.body.password

        });
        console.log(newUser);

        // Save the new user
        newUser.save(function (err) {
            if (err) {
                return res.json({
                    success: false,
                    message: "User not created"
                })
            } else {
                return res.json({
                    success: true,
                    message: "User created"
                })
            }
        });
    }
});

app.post('/authenticate', (req, res) => {

    User.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            console.log(req.body.email);
            return res.json({
            success: false,
            message: 'User not found'
        });}
        else {
            bcrypt.compare(req.body.password + user._id, user.password).then((isMatch) => {
                if (isMatch) {
                    const token = jwt.sign({
                        id: user._id
                    }, config.secret, {
                        expiresIn: 100 // in seconds
                    });
                    res.status(200).json({
                        success: true,
                        token: 'Bearer ' + token
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        message: 'Authentication failed. Passwords did not match.'
                    });
                }

            })
        }
    })


});

// protected route with JWT
app.get('/dashboard', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const User = {}
    User.id = req.user.id;
    User.email = req.user.email;

    
    console.log(User);

    return res.json({
        User
    })
});

app.get('/profile', passport.authenticate('jwt', {
        session: false
    }),
    function (req, res) {
        res.send(req.user.profile);
    }
);

module.exports = app;