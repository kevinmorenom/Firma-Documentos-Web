const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./../models/user');
const app = express();

app.post('/register', function(req, res) {
    console.log(req.body);
    let body = req.body;
    let { email, password, nombre } = body;
    let user = new User({
        email,
        password: bcrypt.hashSync(password, 10),
        nombre,
    });
    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        res.json({
            ok: true,
            user: userDB
        });
    });
});
module.exports = app;