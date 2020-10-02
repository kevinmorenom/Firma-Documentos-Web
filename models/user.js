const mongoose = require("mongoose");
const bodyParser = require('body-parser')
var uniqueValidator = require('mongoose-unique-validator');

let userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    psswd: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    }
});

// elimina la key password del objeto que retorna al momento de crear un usuario
userSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

//plugin validador de valores únicos
userSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser único'
});
module.exports = mongoose.model('Usuario', userSchema);