const mongoose = require("mongoose");
const bodyParser = require('body-parser')
var uniqueValidator = require('mongoose-unique-validator');

let logSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Logs', logSchema);