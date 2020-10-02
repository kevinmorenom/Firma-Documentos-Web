var fs = require('fs');
var https = require('https');
var express = require('express');
var path = require('path');
var crypto = require('crypto');
var fileUpload = require('express-fileupload');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./config/config.js');

var bcrypt = require('bcrypt');
var User = require('./models/user');
var PORT = 8080;

var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//para usar archivos estaticos
app.use('/', express.static(path.join(__dirname, 'public')));
//para poder subir archivos
app.use(fileUpload());
//rutas
app.use(require('./routes/routes'));

//Conexion a la base de datos, y dentro levantar el servidor
mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to database");
    https.createServer({
        key: fs.readFileSync('localhost-key.pem'),
        cert: fs.readFileSync('localhost.pem')
    }, app).listen(PORT, function() {
        console.log("My https server listening on port " + PORT + "...");
    });
}).catch((err) => {
    console.log("Not connected to database", err);
});