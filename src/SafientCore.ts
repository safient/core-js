import { IDX } from '@ceramicstudio/idx';
import { Client, PrivateKey, ThreadID, Where } from '@textile/hub';
import { getThreadId } from './utils/threadDb';
import {generateIDX} from './lib/identity'
import {generateSignature} from './lib/signer'
// @ts-ignore
import shamirs from 'shamirs-secret-sharing';
import { Connection, User, UserBasic, Users, SafeData, Shard, SafeCreation } from './types/types';
import {definitions} from "./utils/config.json"
import {utils} from "./lib/helpers"
import { JWE } from 'did-jwt';
import { decryptData } from './utils/aes';
import { JsonRpcProvider, JsonRpcSigner, TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import {SafientClaims} from "@safient/claims"
import {ethers} from "ethers"
require('dotenv').config();

const safeStages = {
  "ACTIVE" : 0,
  "CLAIMING": 1,
  "RECOVERING": 2,
  "RECOVERED": 3,
  "CLAIMED": 4
}

const claimStages = {
    "ACTIVE": 0,
    "PASSED": 1,
    "FAILED": 2,
    "REJECTED": 3
}
export class SafientCore {
  private signer: JsonRpcSigner;
  private utils: utils;
  private provider: JsonRpcProvider;
  private claims: SafientClaims


  constructor(signer: JsonRpcSigner, chainId: number) {
    this.signer = signer;
    this.utils = new utils();
    this.provider = this.provider
    this.claims = new SafientClaims(signer, chainId)
  }

  /**
   * API 1:connectUser
   *
   */
  connectUser = async (): Promise<Connection> => {
    try{
      const seed = await generateSignature(this.signer)
      const {idx, ceramic} = await generateIDX(Uint8Array.from(seed))
      const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(seed));
      const client = await Client.withKeyInfo({
        key: `${process.env.USER_API_KEY}`,
        secret: `${process.env.USER_API_SECRET}`,
      });
      await client.getToken(identity);
      const threadId = ThreadID.fromBytes(Uint8Array.from(await getThreadId()));
      return { client, threadId, idx };
    }catch(err){
      throw new Error(`Error, while connecting the user, ${err}`);
    }
  };

  /**
   * API 2:registerUser
   *
   */

  registerNewUser = async (
    conn: Connection,
    name: string,
    email: string,
    signUpMode: number,
    userAddress: string
  ): Promise<string> => {
    try {
      let idx: IDX | null = conn.idx
      let did: string = idx?.id || ''
      const data = {
        did,
        name,
        email,
        safes: [],
        signUpMode,
        userAddress
      };

      //get the threadDB user
      const query = new Where('email').eq(email);
      const result: User[] = await conn.client.find(conn.threadId, 'Users', query);

      if (result.length < 1) {
        const ceramicResult = await idx?.set(definitions.profile, {
          name: name,
          email: email
        })
        const newUser = await conn.client.create(conn.threadId, 'Users', [data]);
        return newUser[0];
      } else {
        return `${email} already registered.`
      }
    } catch (err) {
      throw new Error(`Error while registering user, ${err}`);
    }
  };

  /**
   * API 3:getLoginUser
   *
   */
  getLoginUser = async (conn: Connection, did:string): Promise<User> => {
    try {
      const query = new Where('did').eq(did);
      const result: User[] = await conn.client.find(conn.threadId, 'Users', query);

      if (result.length < 1) {
        throw new Error(`${did} is not registered!`);
      } else {
        return result[0];
      }
    } catch (err) {
      throw new Error(err);
    }
  };


  /**
   * API 4:getAllUsers
   *
   */

  getAllUsers = async (conn: Connection): Promise<Users> => {
    try {
      const registeredUsers: User[] = await conn.client.find(conn.threadId, 'Users', {});

      let caller: UserBasic | string = conn.idx?.id || '';
      let userArray: UserBasic[] = [];

      for (let i = 0; i < registeredUsers.length; i++) {
        const result = registeredUsers[i];
        const value: UserBasic = {
          name: result.name,
          email: result.email,
          did: result.did,
        };

        value.did.toLowerCase() === result.did.toLowerCase() ? (caller = value) : (caller = `${value.did} is not registered!`);

        userArray.push(value);
      }

      return {
        userArray,
        caller,
      };
    } catch (err) {
      throw new Error(err);
    }
  };

   /**
   * API 5:randomGuardians
   *
   */
  private randomGuardians = async (conn: Connection, creatorDID: string | any, beneficiaryDID: string | any): Promise<string[]> => {

    try{
      const users: User[] = await conn.client.find(conn.threadId, 'Users', {});
      let guardians: string[] = [];
      let guardianIndex = 0;

      while (guardianIndex <= 2) {
        const index = Math.floor(Math.random() * users.length);

        let randomGuardian = users[index];

        if (
          creatorDID !== randomGuardian.did &&
          beneficiaryDID !== randomGuardian.did &&
          !guardians.includes(randomGuardian.did)
        ) {
          guardians.push(randomGuardian.did);
          guardianIndex = guardianIndex + 1;
        } else {
          guardianIndex = guardians.length;
        }
      }
      return guardians;
    }catch(err){
      throw new Error(`Couldn't fetch random guardians, ${err}`);
    }
  };

  createNewSafe = async (
    creator: Connection,
    beneficiary: Connection,
    creatorDID: string,
    beneficiaryDID:string,
    safeData: any,
    onChain: boolean
  ): Promise<string> => {
    try {
        let guardians: User[] = [];
        let txReceipt: TransactionReceipt | undefined

        const creatorQuery = new Where('did').eq(creatorDID)
        const beneficiaryQuery = new Where('did').eq(beneficiaryDID)
        let creatorUser:User[]  = await creator.client.find(creator.threadId, 'Users', creatorQuery)
        let beneficiaryUser: User[] = await creator.client.find(creator.threadId, 'Users', beneficiaryQuery)



          const guardiansDid: string[] = await this.randomGuardians(creator, creator.idx?.id, beneficiary.idx?.id);


          for(let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++){
              let guardianData: User = await this.getLoginUser(creator, guardiansDid[guardianIndex]);
              guardians.push(guardianData)
          }


          const recoveryProofData = this.utils.generateRecoveryMessage(guardians);
          const signature: string = await this.signer.signMessage(ethers.utils.arrayify(recoveryProofData.hash));


          const encryptedSafeData = await this.utils.generateSafeData(
            safeData,
            beneficiary.idx?.id,
            creator.idx?.id,
            creator,
            guardiansDid,
            signature,
            recoveryProofData.recoveryMessage,
            recoveryProofData.secrets
            )
          //


          const data: SafeCreation = {
            creator: creator.idx?.id,
            guardians: guardiansDid,
            beneficiary: beneficiary.idx?.id,
            encSafeKey: encryptedSafeData.creatorEncKey,
            encSafeData: encryptedSafeData.encryptedData,
            stage: safeStages.ACTIVE,
            encSafeKeyShards: encryptedSafeData.shardData,
            claims: [],
            onChain: onChain
          };

          const safe: string[] = await creator.client.create(creator.threadId, 'Safes', [data])

      if(onChain === true){

        const metaDataEvidenceUri:string = await this.utils.createMetaData('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', creatorUser[0].userAddress);

        const arbitrationFee: number = await this.claims.arbitrator.getArbitrationFee()
        const guardianFee: number = 0.1;


        const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + guardianFee)))

        const tx: TransactionResponse = await this.claims.safientMain.createSafe(beneficiaryUser[0].userAddress, safe[0], metaDataEvidenceUri, totalFee)
        txReceipt = await tx.wait();
      }

      if(txReceipt?.status === 1 || onChain === false){

            if (creatorUser[0].safes.length===0) {
                creatorUser[0].safes = [{
                    safeId: safe[0],
                    type: 'creator'
                }]
            }else {
                creatorUser[0].safes.push({
                    safeId: safe[0],
                    type: 'creator'
                })
            }

            if (beneficiaryUser[0].safes.length===0) {
                beneficiaryUser[0].safes = [{
                    safeId: safe[0],
                    type: 'beneficiary'
                }]
            }else {
                beneficiaryUser[0].safes.push({
                    safeId: safe[0],
                    type: 'beneficiary'
                })
            }

            guardians?.map(guardian => {
              if(guardian.safes.length===0){
                guardian.safes = [{
                  safeId: safe[0],
                  type: 'guardian'
                }]
              }else{
                guardian.safes.push({
                  safeId: safe[0],
                  type: 'guardian'
              })
              }
            })

            await creator.client.save(creator.threadId,'Users',[creatorUser[0]])
            await creator.client.save(creator.threadId,'Users',[beneficiaryUser[0]])

            guardiansDid.forEach((async(guardians, index) => {
              await creator.client.save(creator.threadId,'Users',[guardians[index]])
            }));
      }

      if(txReceipt?.status === 0){
        await creator.client.delete(creator.threadId, 'Users', [safe[0]] );
        console.log("Transaction Failed!");
      }

    return safe[0];

    } catch (err) {
      throw new Error(`Error while creating a safe. ${err}`);
    }
  };

  getSafeData = async (conn: Connection, safeId: string): Promise<SafeData> => {
    try {
      const query = new Where('_id').eq(safeId);
      const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);
      return result[0];
    } catch (err) {
      throw new Error(err);
    }
  };

  claimSafe = async (
    conn: Connection,
    safeId: string,
    file: any,
    evidenceName: string,
    description: string
    ): Promise<number> => {
    try {
        const query = new Where('_id').eq(safeId);
        const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);

        let evidenceUri: string = ''
        let tx: TransactionResponse
        let disputeId:number = 0
        let txReceipt: any

        const creatorQuery = new Where('did').eq(result[0].creator)
        const beneficiaryQuery = new Where('did').eq(result[0].beneficiary)
        let creatorUser:User[]  = await conn.client.find(conn.threadId, 'Users', creatorQuery)
        let beneficiaryUser: User[] = await conn.client.find(conn.threadId, 'Users', beneficiaryQuery)

      if(result[0].onChain === true && result[0].stage === safeStages.ACTIVE){

        evidenceUri = await this.utils.createClaimEvidenceUri(file, evidenceName, description)
        tx = await this.claims.safientMain.createClaim(result[0]._id, evidenceUri)
        txReceipt = await tx.wait()
      }
      if(result[0].onChain === false && result[0].stage === safeStages.ACTIVE){

        const metaDataEvidenceUri:string = await this.utils.createMetaData('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', creatorUser[0].userAddress);
        const arbitrationFee: number = await this.claims.arbitrator.getArbitrationFee()
        const guardianFee: number = 0.1;
        const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + guardianFee)))

        //safeSync
        const createSafetx: TransactionResponse = await this.claims.safientMain.syncSafe(creatorUser[0].userAddress, safeId, metaDataEvidenceUri, totalFee)
        const createSafetxReceipt: TransactionReceipt = await createSafetx.wait();
        if(createSafetxReceipt.status === 1){
          evidenceUri = await this.utils.createClaimEvidenceUri(file, evidenceName, description)
          tx = await this.claims.safientMain.createClaim(result[0]._id, evidenceUri)
          txReceipt = await tx.wait()
        }
      }

      if(txReceipt.status === 1 && result[0].stage === safeStages.ACTIVE){
        let dispute: any = txReceipt.events[2].args[2];
        disputeId = parseInt(dispute._hex);
        result[0].stage = safeStages.CLAIMING

        if( result[0].claims.length === 0 || result[0].claims === undefined){
            result[0].claims = [{
                "createdBy": conn.idx?.id,
                "claimStatus": claimStages.ACTIVE,
                "disputeId": disputeId
            }]
        }else{
            result[0].claims.push({
              "createdBy": conn.idx?.id,
              "claimStatus": claimStages.ACTIVE,
              "disputeId": disputeId
            })
        }
        await conn.client.save(conn.threadId, 'Safes', [result[0]]);
    }
      return disputeId;
    } catch (err) {
      throw new Error(`Error while creating a claim`);
    }
  };

  guardianRecovery = async (conn: Connection, safeId: string, did: string): Promise<boolean> => {
    try {
      const query = new Where('_id').eq(safeId);
      const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);
      const indexValue = result[0].guardians.indexOf(did)
      let recoveryCount: number = 0;

      if(result[0].stage === safeStages.RECOVERING) {
        const decShard = await conn.idx?.ceramic.did?.decryptDagJWE(
          result[0].encSafeKeyShards[indexValue].encShard
        )
        result[0].encSafeKeyShards[indexValue].status = 1
        result[0].encSafeKeyShards[indexValue].decData = decShard

        result[0].encSafeKeyShards.map((safeShard) => {
          if(safeShard.status === 1){
            recoveryCount = recoveryCount + 1;
          }
        })

        if(recoveryCount >= 2){
          result[0].stage = safeStages.RECOVERED
        }else{
          result[0].stage = safeStages.RECOVERING
        }
      }

      await conn.client.save(conn.threadId,'Safes',[result[0]])

      return true;
      } catch (err) {
      throw new Error(`Error while guardian Recovery, ${err}`);
    }
  };

  decryptSafeData = async(conn: Connection, safeId: string): Promise<any> =>{
    try{
      const safeData:SafeData = await this.getSafeData(conn, safeId);
      const encSafeData = safeData.encSafeData
      const aesKey = await conn.idx?.ceramic.did?.decryptDagJWE(safeData.encSafeKey)
      const data = await decryptData(encSafeData, aesKey);
      const reconstructedData = JSON.parse(data.toString());
      return reconstructedData;
    }catch(err){
      throw new Error(`Error whole decrypting data, ${err}`)
    }
  }



      private updateStage = async(conn: Connection, safeId: string, claimStage: number, safeStage: number): Promise<boolean> => {
        try{
          const query = new Where('_id').eq(safeId);
          const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);
          result[0].stage = safeStage;
          result[0].claims[0].claimStatus = claimStage;

          await conn.client.save(conn.threadId, 'Safes', [result[0]]);
          return true;
        }catch(err){
          throw new Error(`Error while updating a stage ${err}`)
        }
      }

      recoverData = async (conn: Connection, safeId: string, did: string): Promise<any> => {
        try {
          const query = new Where('_id').eq(safeId);
          const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);
          let shards: Object[] = [];
          let data: any;
          if(result[0].stage === safeStages.RECOVERED || result[0].stage === safeStages.CLAIMED){

            result[0].encSafeKeyShards.map(share => {
              share.status === 1 ? shards.push(share.decData.share) : null
            })

            data = await this.utils.reconstructShards(conn, shards,result[0].encSafeData);
            if(data && result[0].stage === safeStages.RECOVERED){
              await this.updateStage(conn, safeId, claimStages.PASSED, safeStages.CLAIMED);
            }

            result[0].stage = safeStages.CLAIMED
          }
          return data;
          } catch (err) {
          throw new Error(`Error while recovering data for Beneficiary, ${err}`);
        }
      };

      getOnChainData = async (safeId: string) => {
        try{
          const data = await this.claims.safientMain.getSafeBySafeId(safeId)
          return data
        }catch(err){
          throw new Error('Error while getting onChain data')
        }
      }

      getOnChainClaimData = async(claimId: number) => {
        try{
          const data = await this.claims.safientMain.getClaimByClaimId(claimId)
          return parseInt(data.disputeId._hex);
        }catch(err){
          throw new Error("Error while getting onChain claim data")
        }

      }

      syncStage = async(conn: Connection, safeId: string): Promise<boolean> => {
        try{
          const query = new Where('_id').eq(safeId);
          const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);
          let disputeId: number = 0
          let claimIndex : number = 0
          const claims = result[0].claims

          claims.map((claim,index) => {
            if(claim.claimStatus === claimStages.ACTIVE){
              disputeId = claim.disputeId;
              claimIndex = index
            }
          })
          const claimStage = await this.claims.safientMain.getClaimStatus(disputeId);
          if(claimStage === claimStages.PASSED){
            result[0].stage = safeStages.RECOVERING;
            result[0].claims[claimIndex].claimStatus = claimStages.PASSED;
          }
          if(claimStage === claimStages.FAILED || claimStage === claimStages.REJECTED){
              result[0].stage = safeStages.ACTIVE;
              result[0].claims[claimIndex].claimStatus = claimStage;
          }

          await conn.client.save(conn.threadId, 'Safes', [result[0]]);
          return true;
        }catch(err){
          throw new Error(`Error while syncing stage data, ${err}`)
        }

      }


      /**
       * Disclaimer: Internal API only. Not production API.
       * Use at your loss.
       * If you reading this code and come across this. Be warned not to use this at all
       *  */
      giveRuling = async(disputeId: number, ruling: number): Promise<boolean> => {
        try{
          const result: boolean = await this.claims.arbitrator.giveRulingCall(disputeId, ruling)
          return result;
        }catch(err){
          throw new Error('Error while giving a ruling for dispute')
        }

      }

      incentiviseGuardians = async(conn: Connection, safeId: string): Promise<boolean> =>{
        try{
          const query = new Where('_id').eq(safeId);
          const result: SafeData[] = await conn.client.find(conn.threadId, 'Safes', query);
          let shards: any = []
          let guardianArray: any = [];
          let guardianSecret: string[] = [];
          let tx: boolean = false
            if(result[0].stage === safeStages.CLAIMED){
                result[0].encSafeKeyShards.map((share) => {
                  if(share.status === 1){
                    shards.push(share.decData.share)
                    guardianSecret.push(share.decData.secret);
                  }
                })

                if(shards.length !== 0){
                  const reconstructedData = shamirs.combine([Buffer.from(shards[0]), Buffer.from(shards[1])])
                  const data = JSON.parse(reconstructedData.toString());

                  const message = data.message;
                  message.data.guardians.map((guardian: any) => {
                    const guardianTuple = [guardian.secret, guardian.address]
                    guardianArray.push(guardianTuple);
                  })

                  tx = await this.claims.safientMain.guardianProof(
                    JSON.stringify(message),
                    data.signature,
                    guardianArray,
                    guardianSecret,
                    safeId
                    )
                }
            }
            return tx
        }catch(e){
          throw new Error("Error while incentiving the guardians")
        }
      }


}
