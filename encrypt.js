const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

// input file
const r = fs.createReadStream('public/files/' + req.body.name);

// encrypt content
const encrypt = crypto.createCipheriv(algorithm, secretKey, iv);

// decrypt content
const decrypt = crypto.createDecipheriv(algorithm, secretKey, iv);

// write file
const w = fs.createWriteStream('public/files/' + req.body.name);

// start pipe
r.pipe(encrypt)
    //.pipe(decrypt)
    .pipe(w);
fs.rename('public/files/' + req.body.name, 'public/files/ENCRYPTED_' + req.body.name, function(err) {
    if (err) throw err;
    console.log('File Renamed.');
});
res.send("File Encrypted");