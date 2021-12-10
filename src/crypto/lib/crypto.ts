import { Connection, SafeEncrypted, GuardianSecrets, RecoveryMessage, Shard, Share, User, SafeStore } from "../../lib/types"
import {_decryptData, _encryptData, _generateCipherKey, _shamirCombine, _shamirSplit} from "../utils/encryption"
import {randomBytes, JWE, utils} from "../utils/helpers"


export class Crypto {


    /**
     * 
     * @param safeData - Data that is stored on the safe
     * @param beneficiaryDid - DID of the beneficiary
     * @param creatorDid - DID of the creator
     * @param creator - Connection Object of the creator
     * @param guardians - Array of Guardian DIDs
     * @param signature - Signature of the message by creator
     * @param recoveryMessage - RecoveryMessage created for guardians
     * @param secrets - Array of secrets for guardians
     * @returns Encrypted Safe Data 
     */
    encryptSafeData = async (
    safeData: SafeStore, 
    beneficiaryDid: string,
    creatorDid: any,
    creator: Connection,
    guardians: string [],
    signature: string,
    recoveryMessage: string,
    secrets: string []
    ): Promise<SafeEncrypted> => {

        let shardData: Shard[] = [];

        try{

            //Generate AES key
            const aesKey: any = await _generateCipherKey();

            // Encrypt data

            const encryptedData: Buffer = await _encryptData(
                Buffer.from(JSON.stringify({data: safeData})),
                aesKey
            );

            //Encrypt AES for creator
            const creatorEncKey: JWE = await creator.idx?.ceramic.did?.createDagJWE(aesKey, [creatorDid])!;

            //Encrypt AES for beneficiary
            const beneficiaryEncKey: JWE = await creator.idx?.ceramic.did?.createDagJWE(aesKey, [beneficiaryDid])!;

            const ShareData: Share = {
                beneficiaryEncKey : beneficiaryEncKey,
                message: JSON.parse(recoveryMessage),
                signature: signature
            }

            const shards: Buffer[] = _shamirSplit(ShareData, 3, 2);

            for (let index = 0; index < shards.length; index++){
                shardData.push({
                    status: 0,
                    encShard: await creator.idx?.ceramic.did?.createDagJWE({
                        share: shards[index],
                        secret: secrets[index]
                    }, [guardians[index]]),
                    decData: null 
                })
            }

            let result: SafeEncrypted = {
                creatorEncKey: creatorEncKey,
                beneficiaryEncKey: beneficiaryEncKey,
                encryptedData: encryptedData,
                shardData: shardData,
            }

            return result;

        }catch(err){
            throw new Error(`Error while encrypting safe data`)
        }
    }

    /**
     * 
     * @param encKey - Encrypted AES key
     * @param connection - Connection object of the user
     * @param encryptedData - Encrypted Safe Data
     * @returns Decrypted Data
     */
    decryptSafeData = async(encKey: any, connection: Connection, encryptedData: any): Promise<any> => {

        const aesKey: any = await connection.idx?.ceramic.did?.decryptDagJWE(encKey);

        const decryptedData = await _decryptData(encryptedData, aesKey);

        return decryptedData;

    }


    /**
     * 
     * @param shards - Recovered shards of the guardians
     * @returns Share pf the data 
     */
    reconstructSafeData = async(
        shards: any,
    ): Promise<Share> => {
        try {

            //Reconstruct the shards from guardians
            const reconstructedData = _shamirCombine(shards);

            //Get encrytped data
            const encryptedData = JSON.parse(reconstructedData.toString());

            return encryptedData

        }catch(err){
            throw new Error(`Error while recontructing data`)
        }
    }

    /**
     * 
     * @param guardians - Array of Guardians of the Safes
     * @returns - Recovery message
     */
    generateSecrets = (guardians: User[]): RecoveryMessage => {
        try{
            let guardiansSecrets: GuardianSecrets[] =[];
            let hash: string;
            let secrets: string[] = [];

            guardians.map((guardian: User) => {
                const guardianSecret: Buffer = randomBytes(4);
                secrets.push(guardianSecret.toString('hex'));
                guardiansSecrets.push({
                    secret: utils.solidityKeccak256(['string'], [guardianSecret.toString('hex')]),
                    address: guardian.userAddress.toLowerCase()
                })
            })

            const recoveryMessage: string = JSON.stringify({
                data: {
                    guardians: guardiansSecrets
                }
            })

            hash = utils.solidityKeccak256(["string"], [recoveryMessage])

            const result: RecoveryMessage = {
                guardians: guardiansSecrets,
                hash: hash,
                recoveryMessage: recoveryMessage,
                secrets: secrets
            }

            return result

        }catch(err){
            throw new Error(`Error while creating recovery messages, ${err}`)

        }
    }


}