import { IDX } from '@ceramicstudio/idx';
import { Client, PrivateKey, ThreadID, Where } from '@textile/hub';
import { JWE } from 'did-jwt';

// @ts-ignore
import shamirs from 'shamirs-secret-sharing';
import { Connection, User, UserBasic, Users, SafeData, Shard } from '../types/types';
import {generateCipherKey, encryptData, decryptData} from "../utils/aes"
require('dotenv').config();
export class utils {
 
    generateSafeData = async (
        safeData: any, 
        inheritorDid: any, 
        creatorDid: any, 
        creator: Connection, 
        guardians: string []): 
        Promise<any> => {
        try{
             //generate a AES key
            const aesKey: any = await generateCipherKey();

            //encrypt the data
            const encryptedData: Object = await encryptData(
                Buffer.from(JSON.stringify({data: safeData})),
                aesKey
            )

            //Encrypt AES for creator
            const creatorEncKey = await creator.idx?.ceramic.did?.createDagJWE(aesKey, [creatorDid]);

            //Encrypt AES for inheritor
            const inheritorEncKey = await creator.idx?.ceramic.did?.createDagJWE(aesKey, [inheritorDid]);
            
            const Sharedata: Object = {
                inheritorEncKey: inheritorEncKey
            }

            const secretShares: Buffer[] = shamirs.split(JSON.stringify(Sharedata), {shares: 3, threshold: 2})

            let shardData: any[] = []
            for(let index = 0; index < secretShares.length; index++) {
                shardData.push({
                    status: 0,
                    encShard: await creator.idx?.ceramic.did?.createDagJWE(secretShares[index], [guardians[index]]),
                    decData: null
                })
                
            };
               
            let data: Object = {
                creatorEncKey: creatorEncKey,
                inheritorEncKey: inheritorEncKey,
                encryptedData: encryptedData,
                shardData: shardData,
            }

            return data
        }
       catch(e){
           console.log("Error in safe data creation")
           return(e);
       }

    }


    reconstructShards = async(
        inheritor: Connection,
        shards: any,
        encryptedSafeData: Buffer
    ): Promise<any> => {
        const reconstructedData = shamirs.combine([Buffer.from(shards[0]), Buffer.from(shards[1])])

        const encryptedData = JSON.parse(reconstructedData.toString());

        const aesKey = await inheritor.idx?.ceramic.did?.decryptDagJWE(encryptedData.inheritorEncKey);

        const decryptedData = await decryptData(encryptedSafeData, aesKey)

        return JSON.parse(decryptedData.toString())
    }

}
