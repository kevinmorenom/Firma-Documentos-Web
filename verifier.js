const speakeasy = require('speakeasy');

var verified = speakeasy.totp.verify({
    secret: '(M^xvNL(#y&T#xFZvxa:lIRTm>($/)bZ',
    encoding: "ascii",
    token: "047483"
});
console.log(verified);