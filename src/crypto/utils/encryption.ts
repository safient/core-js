const crypto = require('crypto');
const aes = require('./aes')
export {_generateCipherKey} from "./aes";
export * from "./shamirs"

//Encryption
export const _encryptData = async (data: Object, cipherKey: Object): Promise<Buffer> => {
  const result: Buffer = await aes._aesEncryption(data, cipherKey);
  return result
};

//Decryption
export const _decryptData = async(data: any, cipherKey: any): Promise<Object> => {
  const result: Object = await aes._aesDecryption(data, cipherKey);
  return result
};

