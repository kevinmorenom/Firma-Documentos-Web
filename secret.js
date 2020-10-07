const qrcode = require('qrcode');
const speakeasy = require('speakeasy');

var secret = speakeasy.generateSecret({
    name: "We are Devs"
});

console.log(secret);
qrcode.toDataURL(secret.otpauth_url, function(err, data) {
    console.log(data);
});