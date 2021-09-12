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