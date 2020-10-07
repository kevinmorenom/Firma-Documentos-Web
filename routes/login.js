const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./../models/user');
const qrcode = require('qrcode');
const speakeasy = require('speakeasy');
const Logs = require('../models/logs');
const date = require('date-and-time');
let jwt = require('jsonwebtoken');
const app = express();

var secret;

app.post('/login', function(req, res) {
    let body = req.body;
    User.findOne({ email: body.email }, (erro, userDB) => {
        if (erro) {
            return res.status(500).json({
                ok: false,
                err: erro
            })
        }
        // Verifica que exista un usuario con el mail escrita por el usuario.
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrectos"
                }
            });
        }
        // Valida que la contraseña escrita por el usuario, sea la almacenada en la db
        if (!bcrypt.compareSync(body.psswd, userDB.psswd)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrectos"
                }
            });
        }
        // Genera el token de autenticación
        let token = jwt.sign({
            usuario: userDB,
        }, process.env.SEED_AUTENTICACION, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });

        var now = new Date();
        secret = speakeasy.generateSecret({
            name: (body.email + " " + date.format(now, 'hh:mm, MMM DD'))
        });
        qrcode.toDataURL(secret.otpauth_url, function(err, data) {
            res.json({
                ok: true,
                usuario: userDB,
                token,
                data
            });
        });

    });



});

app.post('/auth', function(req, res) {
    let body = req.body;
    var verified = speakeasy.totp.verify({
        secret: secret.ascii,
        encoding: "ascii",
        token: body.code
    });
    if (verified == true) {
        var log = new Logs({
            name: body.name,
            date: (new Date())
        });
        log.save((err, log) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err,
                });
            }
        });
    }
    res.json({
        verified
    });

});

app.get('/getlogs', function(req, res) {
    let body = req.body;
    Logs.find((erro, logs) => {
        if (erro) {
            return res.status(500).json({
                ok: false,
                err: erro
            })
        }
        // Verifica que exista un usuario con el mail escrita por el usuario.
        res.json({
            logs
        });
    });

});

module.exports = app;