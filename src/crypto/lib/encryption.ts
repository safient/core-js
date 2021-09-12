const crypto = require('crypto');

//Encryption
export const _encryptData = function (data: Object, cipherKey: Object): Promise<Buffer> {
    
  return new Promise((resolve) => {
    let iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes256', cipherKey, iv);
    const encryptedData: Buffer = Buffer.concat([iv, cipher.update(data), cipher.final()]);
    resolve(encryptedData);
  });

};

//Decryption
export const _decryptData = async function (data: any, cipherKey: any): Promise<Object> {

  let encryptedData = Buffer.from(data, 'hex')
  const iv = encryptedData.slice(0, 16);
  encryptedData = encryptedData.slice(16);
  return new Promise((resolve) => {
    const decipher = crypto.createDecipheriv('aes256', cipherKey, iv);
    const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    resolve(decryptedData);
  });

};