const crypto = require('crypto')

export const generateCipherKey = function(){
    try {
        const seed = crypto.randomBytes(32).toString()
        return new Promise((resolve)=>{
            const cipherKey = crypto.createHash('sha256').update(seed).digest();
            resolve(cipherKey)
        })
    }catch (err) {
        console.error("Error while generating symmetric key:",err)
        return null
    }
}

export const encryptData = function(data, cipherKey){
    return new Promise((resolve)=>{
        let iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes256', cipherKey, iv);
        const encryptedData= Buffer.concat([
            iv,
            cipher.update(data),
            cipher.final()
        ]);
        resolve(encryptedData)
    })
}

export const decryptData = async function(encryptedData, cipherKey){
    const iv = encryptedData.slice(0,16)
    encryptedData = encryptedData.slice(16)
    return new Promise((resolve)=>{
        const decipher = crypto.createDecipheriv("aes256",cipherKey,iv)
        const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        resolve(decryptedData)
    })
}