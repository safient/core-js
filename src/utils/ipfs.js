const fetch = require("node-fetch");

export const ipfsPublish = async (fileName, data) => {
    const buffer = await Buffer.from(data);
  
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