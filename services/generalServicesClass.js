const db = require("../models");
const { } = require('../../query');

var crypto = require('crypto');

const { secret,IVString } = require('../../config');
const algorithm = 'aes-256-cbc';
const iv = crypto.scryptSync(IVString, 'salt', 16);
const key = crypto.scryptSync(secret, 'salt', 32);


class General {

  encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }
 
  decrypt(text) {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

}
module.exports = General;