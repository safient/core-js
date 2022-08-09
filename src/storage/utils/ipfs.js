const fetch = require("node-fetch");
const encoder = new TextEncoder();
const {create} = require('ipfs-http-client')

const client = create(`https://ipfs.kleros.io/api/v0`)

export const ipfsPublish = async (fileName, data) => {
    const encodedData = encoder.encode(data)
    const buffer = await Buffer.from(encodedData);
    return new Promise((resolve, reject) => {
      fetch('https://ipfs.kleros.io/add', {
        method: 'POST',
        body: JSON.stringify({
          fileName,
          buffer,
        }),
        headers: {
          'content-type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((success) => resolve(success.data))
        .catch((err) => reject(err));
    });
  };

  export const ipfsAdd = async (data) => {
    try{
      const result = await client.add(data)
      return result
    }catch(e){
      throw new Error(`Error while adding data to IPFS, ${e}`)
    }
  };

  export const ipfsGet = async (cid) => {
    const result = await client.cat(cid);
    return result

  };