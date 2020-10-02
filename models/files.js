const mongoose = require("mongoose");
const bodyParser = require('body-parser')
var uniqueValidator = require('mongoose-unique-validator');

let fileSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    }
});

//plugin validador de valores únicos
fileSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser único'
});
module.exports = mongoose.model('File', fileSchema);