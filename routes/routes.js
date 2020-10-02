var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
var User = require('../models/user');
var fs = require('fs');
var crypto = require('crypto');
var File = require('../models/files');
var globby = require('globby');
var qrcode = require('qrcode');

app.use(require('./login'));
// app.use(require('./register'));
app.post('/register', function(req, res) {
    let body = req.body;
    let { email, psswd, nombre } = body;
    let user = new User({
        email,
        psswd: bcrypt.hashSync(psswd, 10),
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

app.post('/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    //EL nombre del campo input es el nombre del archivo subido
    let sampleFile = req.files.sampleFile;

    // usamos mv() para mover el archivo a la ruta especificada
    sampleFile.mv('public/files/' + req.files.sampleFile.name, function(err) {
        if (err)
            return res.status(500).send(err);
        else {
            //FIRMAR DOCUMENTO 
            var private_key = fs.readFileSync('keys/privateKey.pem', 'utf-8');

            // Documento a firmar
            var doc = fs.readFileSync('public/files/' + req.files.sampleFile.name);

            // Firmar
            var signer = crypto.createSign('RSA-SHA256');
            signer.write(doc);
            signer.end();

            //Devuelve la firma en base64
            var signature = signer.sign(private_key, 'base64');

            // console.log('Digital Signature: ', signature);
            //Guardamos la firma en la carpeta de los archivos firmados
            fs.writeFileSync('public/signedfiles/signed_' + req.files.sampleFile.name, signature);

            run().catch(error => console.error(error.stack));

            async function run() {
                const res = await qrcode.toDataURL(signature);

                fs.writeFileSync('public/qrcodes/qr_' + req.files.sampleFile.name + '.html', `<img src="${res}">`);
            }
            res.redirect('/home.html');
        }
    });
});

app.get('/files', async function(req, res) {
    //Para mostrar los archivos de mi servidor en el html
    var paths = await globby(['public/files/']);
    //globby me devuelve arrego con los nombres archivos existentes el path que le especifiqué
    //para cada elemento del archivo  le quitamos la ruta, dejamos solo el nombre del archivo
    const pathsNew = paths.map(function(x) {
        return x.replace('public/files/', '');
    });
    res.send(pathsNew);
});

app.post('/verify', function(req, res) {

    console.log(req.body.name);


    // Leemos el archivo de clave publica
    var public_key = fs.readFileSync('keys/publicKey.pem', 'utf-8');

    // Leemos la firma que guardamos cuando firmamos el documento
    var signatured2 = fs.readFileSync('public/signedfiles/signed_' + req.body.name, 'utf-8');

    // Leemos el documento que se quiere verificar junto con la firma
    var doc2 = fs.readFileSync('public/files/' + req.body.name);

    // Verificar
    var verifier = crypto.createVerify('RSA-SHA256');
    verifier.write(doc2);
    verifier.end();

    // result = false o true
    var result = verifier.verify(public_key, signatured2, 'base64');
    console.log('Digital Signature Verification : ' + result);
    if (result == false) {
        return res.status(250).send('Verificación Fallida');
    } else {
        return res.status(200).send('Verificación Exitosa');
    }

});

module.exports = app;