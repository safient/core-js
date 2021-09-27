const crypto = require('crypto');

export const _generateCipherKey = () => {
  try {
    const seed = crypto.randomBytes(32).toString();
    return new Promise((resolve) => {
      const cipherKey = crypto.createHash('sha256').update(seed).digest();
      resolve(cipherKey);
    });
  } catch (err) {
    console.error('Error while generating symmetric key:', err);
    return null;
  }
};

export const _aesEncryption = async (data: Object, cipherKey: Object): Promise<Buffer> => {
  return new Promise((resolve) => {
    let iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes256', cipherKey, iv);
    const encryptedData: Buffer = Buffer.concat([iv, cipher.update(data), cipher.final()]);
    resolve(encryptedData);
  });
}


export const _aesDecryption = async (data: any, cipherKey: any): Promise<Object>  => {

  let encryptedData = Buffer.from(data, 'hex')
  const iv = encryptedData.slice(0, 16);
  encryptedData = encryptedData.slice(16);
  return new Promise((resolve) => {
    const decipher = crypto.createDecipheriv('aes256', cipherKey, iv);
    const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    resolve(decryptedData);
  });

}