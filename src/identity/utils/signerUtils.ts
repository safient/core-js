import {BigNumber, utils} from 'ethers'

import {Signer} from "../../lib/types"

const generateMessageForEntropy = (ethereum_address: string, application_name: string): string => {
  return (
    'Sign this message to generate your Safient Identity for the following address \n' + 
    ethereum_address +
    '\n This identity lets the application to authenticate to the Safient Protocol \n' + 
    '\n' +
    '\n' +
    'IMPORTANT: Only sign this message if you trust the application and the origin is https://safient.io '
  );
}

export const generateSignature = async (signer: Signer): Promise<any> => {
    let signedText: string;
    const userAddress: string = await signer.getAddress();
    const message: string = generateMessageForEntropy(userAddress, 'Safient')
    signedText = await signer.signMessage(message);
  
  const hash: any  = utils.keccak256(signedText);
  const seed: any = hash
    // @ts-ignore
    .replace('0x', '')
    // @ts-ignore
    .match(/.{2}/g)
    .map((hexNoPrefix:any) => BigNumber.from('0x' + hexNoPrefix).toNumber())
  return seed
}