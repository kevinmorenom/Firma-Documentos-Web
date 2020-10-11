const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./../models/user');
const qrcode = require('qrcode');
const Logs = require('../models/logs');
const speakeasy = require('speakeasy');
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

        var verified = speakeasy.totp.verify({
            secret: userDB.secret,
            encoding: "ascii",
            token: body.code
        });
        if (verified == true) {
            var log = new Logs({
                name: userDB.email,
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
        } else {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Token incorrecto"
                }
            });

        }

        // Genera el token de autenticación
        let token = jwt.sign({
            usuario: userDB,
        }, process.env.SEED_AUTENTICACION, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });

        res.json({
            ok: true,
            usuario: userDB,
            token,
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