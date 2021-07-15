import { IDX } from '@ceramicstudio/idx';
import { Client, PrivateKey, ThreadID, Where } from '@textile/hub';
import { JWE } from 'did-jwt';
import { randomBytes } from 'crypto' 
import {ethers} from "ethers"
// @ts-ignore
import shamirs from 'shamirs-secret-sharing';
import { Connection, User, UserBasic, Users, SafeData, Shard, RecoveryMessage, GuardianSecrets } from '../types/types';
import {generateCipherKey, encryptData, decryptData} from "../utils/aes"
import { TextEncoder } from 'util';
import {ipfsPublish} from "../utils/ipfs"
require('dotenv').config();

export class utils {
 
    private safientAgreementLink: string =
    'https://ipfs.kleros.io/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png';
    private safientAgreementURI: string = '/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png';
    private encoder = new TextEncoder();


    
    generateSafeData = async (
        safeData: any, 
        inheritorDid: any, 
        creatorDid: any, 
        creator: Connection, 
        guardians: string [],
        signature: string,
        recoveryMessage: string,
        secrets: string[]
        ): 
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
                inheritorEncKey: inheritorEncKey,
                message : JSON.parse(recoveryMessage),
                signature: signature
            }

            const secretShares: Buffer[] = shamirs.split(JSON.stringify(Sharedata), {shares: 3, threshold: 2})
            const shardOne = await creator.idx?.ceramic.did?.createDagJWE({share:secretShares[0], secret:secrets[0]}, [guardians[0]]);
            const shardTwo = await creator.idx?.ceramic.did?.createDagJWE({share:secretShares[1], secret:secrets[1]}, [guardians[1]]);
            const shardThree = await creator.idx?.ceramic.did?.createDagJWE({share:secretShares[2], secret:secrets[2]}, [guardians[2]])

            const shardData = [
                {
                    status: 0, 
                    encShard : shardOne, 
                    decData: null
                },
                {
                    status: 0, 
                    encShard : shardTwo, 
                    decData: null
                },
                {
                    status: 0, 
                    encShard : shardThree, 
                    decData: null
                }
            ]
           
            
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

    generateRecoveryMessage = (guardians: User[]): RecoveryMessage => {
        console.log(guardians)
        let gurdiansArray: GuardianSecrets[] = []
        let hash: string
        let secrets: string[] = []

        guardians.map((guardian: User) => {
            const guardianSecret = randomBytes(4)
            secrets.push(guardianSecret.toString('hex'))
            gurdiansArray.push({
                secret: ethers.utils.solidityKeccak256(['string'],[guardianSecret.toString('hex')]),
                address: guardian.userAddress.toLowerCase()
            })
        })

        console.log(gurdiansArray);

        const recoveryMessage: string = JSON.stringify({
            data: {
                guardians: gurdiansArray
            }
        })

        hash = ethers.utils.solidityKeccak256(["string"], [recoveryMessage])

        const data: RecoveryMessage = {
            guardians: gurdiansArray,
            hash: hash,
            recoveryMessage:recoveryMessage,
            secrets: secrets
        }

        return data
    }


     createMetaData = async (safexMainContractAddress: string, address: string) => {

        //const encoder = new TextEncoder();

        const metaevidenceObj = {
          fileURI: this.safientAgreementURI,
          fileHash: 'QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13',
          fileTypeExtension: 'png',
          category: 'Safex Claims',
          title: 'Provide a convenient and safe way to propose and claim the inheritance and safekeeping mechanism',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          aliases: {
            [safexMainContractAddress]: 'SafexMain',
            [address]: [address],
          },
          question: 'Does the claimer qualify for inheritence?',
          rulingOptions: {
            type: 'single-select',
            titles: ['Yes', 'No'],
            descriptions: ['The claimer is qualified for inheritence', 'The claimer is not qualified for inheritence'],
          },
        };
        const cid: any = await ipfsPublish('metaEvidence.json', this.encoder.encode(JSON.stringify(metaevidenceObj)));
        console.log(cid);
        const metaevidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;
        return metaevidenceURI
      }

}
