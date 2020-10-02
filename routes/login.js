const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./../models/user');
let jwt = require('jsonwebtoken');
const app = express();


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
        res.json({
            ok: true,
            usuario: userDB,
            token
        });
    });



});

module.exports = app;