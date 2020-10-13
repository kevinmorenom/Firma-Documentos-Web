var express = require('express');
var app = express();
var bcrypt = require('bcrypt');
var User = require('../models/user');
var fs = require('fs');
var crypto = require('crypto');
var Logs = require('../models/logs');
var globby = require('globby');
var qrcode = require('qrcode');
const zlib = require('zlib');
const speakeasy = require('speakeasy');
const date = require('date-and-time');
const AppendInitVect = require('./appendInitVect');
//KEY PARA ENCRIPTAR
const ENC_KEY = fs.readFileSync('keys/ENC_KEY.pem'); //32 caracteres =256 bits;


app.use(require('./login'));
// app.use(require('./register'));
app.post('/encryption', function(req, res) {
    // Generate a secure, pseudo random initialization vector.
    const initVect = crypto.randomBytes(16);

    // Generate a cipher key from the password.
    const readStream = fs.createReadStream('public/files/' + req.body.file);
    const gzip = zlib.createGzip();
    const cipher = crypto.createCipheriv('aes256', ENC_KEY, initVect);
    const appendInitVect = new AppendInitVect(initVect);
    // Create a write stream with a different file extension.
    const writeStream = fs.createWriteStream('public/files/' + req.body.file + '.enc');
    readStream
        .pipe(gzip)
        .pipe(cipher)
        .pipe(appendInitVect)
        .pipe(writeStream);
    fs.unlinkSync('public/files/' + req.body.file);
    res.send("File Encrypted");
});

app.post('/decryption', function(req, res) {
    const readInitVect = fs.createReadStream('public/files/' + req.body.file, { end: 15 });

    // Wait to get the initVect.
    let initVect;
    readInitVect.on('data', (chunk) => {
        initVect = chunk;
    });
    let errors = 0;
    // Once we’ve got the initialization vector, we can decrypt the file.
    readInitVect.on('close', () => {
        const readStream = fs.createReadStream('public/files/' + req.body.file, { start: 16 });
        const decipher = crypto.createDecipheriv('aes256', ENC_KEY, initVect);
        const unzip = zlib.createUnzip();
        const writeStream = fs.createWriteStream('public/files/' + req.body.file + '.unenc');


        readStream
            .pipe(decipher).on('error', err => {
                console.log(err);
                errors = 1;

            })
            .pipe(unzip).on('error', err => {
                console.log(err);
                errors = 2;

            })
            .pipe(writeStream).on('error', err => {
                console.log(err);
                errors = 3;
            });
        writeStream.on('open', function() {
            var filename = 'public/files/' + req.body.file.replace(".enc", "").replace(".unenc", "");
            fs.rename('public/files/' + req.body.file + '.unenc', filename, function(err) {
                if (err) throw err;
                fs.unlinkSync('public/files/' + req.body.file);
                res.json({
                    ok: true,
                    errors: errors
                });
            });
        });
    });

});

app.post('/register', function(req, res) {
    let body = req.body;
    let { email, psswd, nombre } = body;
    var now = new Date();
    var secret = speakeasy.generateSecret({
        name: (body.email + " " + date.format(now, 'hh:mm, MMM DD'))
    });
    let usuario;
    let user = new User({
        email,
        psswd: bcrypt.hashSync(psswd, 10),
        nombre,
        secret: secret.ascii
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }
        usuario = userDB;
    });

    qrcode.toDataURL(secret.otpauth_url, function(err, data) {
        res.json({
            ok: true,
            usuario: usuario,
            data
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
    if (result == false) {
        fs.rename('public/files/' + req.body.name, 'public/files/CORRUPTED_' + req.body.name, function(err) {
            if (err) throw err;
        });
        return res.status(250).send('Verificación Fallida');

    } else {
        return res.status(200).send('Verificación Exitosa');
    }

});

app.post('/edit', async function(req, res) {
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
        } else {
            var now = new Date();
            var secret = speakeasy.generateSecret({
                name: (body.email + " " + date.format(now, 'hh:mm, MMM DD'))
            });
            User.updateOne({ "email": body.email }, { $set: { "email": body.newemail, "nombre": body.newname, "secret": secret.ascii } }, function(err, result) {

                qrcode.toDataURL(secret.otpauth_url, function(err, data) {
                    res.json({
                        ok: true,
                        email: body.newemail,
                        nombre: body.newname,
                        data
                    });
                });
            });

        }

    });

});



module.exports = app;