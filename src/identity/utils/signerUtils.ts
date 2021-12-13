import {BigNumber, utils} from 'ethers'

import {Signer} from "../../lib/types"

const generateMessageForEntropy = (ethereum_address: string, application_name: string): string => {
  return (
    '******************************************************************************** \n' +
    'READ THIS MESSAGE CAREFULLY. \n' +
    'DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND WRITE \n' +
    'ACCESS TO THIS APPLICATION. \n' +
    'DO NOT SIGN THIS MESSAGE IF THE FOLLOWING IS NOT TRUE OR YOU DO NOT CONSENT \n' +
    'TO THE CURRENT APPLICATION HAVING ACCESS TO THE FOLLOWING APPLICATION. \n' +
    '******************************************************************************** \n' +
    'The Ethereum address used by this application is: \n' +
    '\n' +
    ethereum_address +
    '\n' +
    '\n' +
    '\n' +
    'By signing this message, you authorize the current application to use the \n' +
    'following app associated with the above address: \n' +
    '\n' +
    application_name +
    '\n' +
    '\n' +
    '\n' +
    'The hash of your non-recoverable, private, non-persisted password or secret \n' +
    'phrase is: \n' +
    '\n' +
    '\n' +
    '\n' +
    '\n' +
    '******************************************************************************** \n' +
    'ONLY SIGN THIS MESSAGE IF YOU CONSENT TO THE CURRENT PAGE ACCESSING THE KEYS \n' +
    'ASSOCIATED WITH THE ABOVE ADDRESS AND APPLICATION. \n' +
    'AGAIN, DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND \n' +
    'WRITE ACCESS TO THIS APPLICATION. \n' +
    '******************************************************************************** \n'
  );
}

export const generateSignature = async (signer: Signer): Promise<any> => {
    let signedText: string;
    const userAddress: string = await signer.getAddress();
    const message: string = generateMessageForEntropy(userAddress, 'Safient')
    signedText = await signer.signMessage(message);
  // else{
  //   const metamask: any = await getAddressAndSigner()
  //   console.log(metamask)
  //   const message: string = generateMessageForEntropy(metamask.address, 'Safient')
  //   signedText = await metamask.signer.signMessage(message);
  //   providerUsed = metamask
  // }
  
  const hash: any  = utils.keccak256(signedText);
  const seed: any = hash
    // @ts-ignore
    .replace('0x', '')
    // @ts-ignore
    .match(/.{2}/g)
    .map((hexNoPrefix:any) => BigNumber.from('0x' + hexNoPrefix).toNumber())
  return seed
}