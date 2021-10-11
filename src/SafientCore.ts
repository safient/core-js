import { IDX } from '@ceramicstudio/idx';
import { JsonRpcProvider, TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import {SafientClaims, Types} from "@safient/contracts"
import {ethers} from "ethers"

// @ts-ignore
import { Connection, User, UserBasic, Users, SafeData, SafeCreation, Share, EncryptedSafeData, UserSchema, Utils, Signer } from './types/types';
import {definitions} from "./utils/config.json"
import {createClaimEvidenceUri, createMetaData, createSafe, generateRandomGuardians, getLoginUser, getSafeData, getUsers, init, queryUserDid, queryUserEmail, registerNewUser, updateStage} from "./logic/index"
import { Database } from './database';
import { Crypto } from './crypto';
import {Auth, Signature} from "./identity"

import {claimStages, safeStages} from "./lib/enums"


require('dotenv').config();



export class SafientCore {
   /** @ignore */
  private signer: Signer;
   /** @ignore */
  private provider: JsonRpcProvider;
   /** @ignore */
  private claims: SafientClaims
   /** @ignore */
  private connection: Connection
   /** @ignore */
  private crypto: Crypto
   /** @ignore */
  private database: Database
   /** @ignore */
  private databaseType: string
   /** @ignore */
  private Utils: Utils
   /** @ignore */
  private auth: Auth
   /** @ignore */
  private signature: Signature

  /**
   * Constructor to initilize the Core SDK.
   * @param signer - Signer object of the wallet.
   * @param chainId - Chain ID.
   * @param databaseType - Type of Database being used.
   */
  constructor(signer: Signer, chainId: number, databaseType: string) {
    this.signer = signer;
    this.provider = this.provider
    this.claims = new SafientClaims(signer, chainId)
    this.databaseType = databaseType
    this.auth = new Auth();
    this.signature = new Signature(signer);
  }

 /**
  * This API generates user ceramic and database connection object
  * @param apiKey - API key of the database being used.
  * @param secret - API secretphrase of the database being used.
  * @returns - Connection datatype
  */
  connectUser = async (apiKey:any, secret:any): Promise<Connection> => {
    try{
      const seed = await this.signature.sign()
      const {idx, ceramic} = await this.auth.generateIdentity(Uint8Array.from(seed))
      const {client, threadId} = await this.auth.generateThread(seed, apiKey, secret)
      const connectionData = { client, threadId, idx };
      this.connection = connectionData;
      this.Utils = init(this.databaseType, this.connection);
      this.crypto = this.Utils.crypto
      this.database = this.Utils.database
      return connectionData
    }catch(err){
      throw new Error(`Error, while connecting the user, ${err}`);
    }
  };

  
  /**
   * This API registers users onto the platform.
   * @param name  - Name of the user
   * @param email - Email of the user 
   * @param signUpMode - Signup mode (0 - Metamask, 1 - Social Login)
   * @param userAddress - Metamask address of the user.
   * @returns - User registration ID
   */
  registerNewUser = async (
    name: string,
    email: string,
    signUpMode: number,
    userAddress: string
  ): Promise<String> => {
    try {
      let idx: IDX | null = this.connection.idx
      let did: string = idx?.id || ''
      const data: UserSchema = {
        did,
        name,
        email,
        safes: [],
        signUpMode,
        userAddress
      };

      const result : string = await registerNewUser(data)
      if(result !== ''){
        const ceramicResult = await idx?.set(definitions.profile, {
          name: name,
          email: email
        })
        return result
      }else {
        return `${email} already registered.`
      }
    
    } catch (err) {
      throw new Error(`Error while registering user, ${err}`);
    }
  };

 
  /**
   * This API is used to get the login information of the user
   * @param did - DID of the user.
   * @returns - Returns User information
   */
  getLoginUser = async (did:string): Promise<User | any> => {
    try {
      const result: any = await getLoginUser(did);
      return result
    } catch (err) {
      throw new Error(`${did} not registered`);
    }
  };


  
  /**
   * This API is used to get all the user basic information on the platform.
   * @returns - Array of users on the platform
   */
  getUsers = async (): Promise<Users> => {
    try {
      const users: Users = await getUsers();
      return users;
    } catch (err) {
      throw new Error("Error while getting new users");
    }
  };

  /**
   * This API is used to select random guardians from the platform for a safe.
   * @ignore
   * @param creatorDID - DID of the safe creator.
   * @param beneficiaryDID - DID of the safe beneficiary.
   * @returns - array of guardian DIDs
   */
  private randomGuardians = async (creatorDID: string | any, beneficiaryDID: string | any): Promise<string[]> => {

    try{
      const guardians: string[] = await generateRandomGuardians(creatorDID, beneficiaryDID);
      return guardians;
    }catch(err){
      throw new Error(`Couldn't fetch random guardians, ${err}`);
    }
  };


  /**
   * This is API is used to query users information using email.
   * @param email - Email of the user being queried
   * @returns - User's basic information
   */
  queryUser = async (email:string): Promise<UserBasic | Boolean> => {
    try {

      const result: UserBasic | Boolean = await queryUserEmail(email)
      return result;

      }catch (err) {
      throw new Error("Error while querying user");
    }
  };



  
  /**
   * This API is used to create a safe either onChain or offChain.
   * @param creatorDID - DID of the user who creates the safe.
   * @param beneficiaryDID - DID of the user who inherits the safe.
   * @param safeData - Data being stored in the safe.
   * @param onChain - The data to be stored onChain or offChain.
   * @param claimType - The safe is claimed through either "Arbitration" or "Signal" (Arbitration - 0, Signal - 1)
   * @param signalingPeriod - If it's "Signal" based claim, Signaling period is provided
   * @returns - ID generated for the Safe. 
   */
  createNewSafe = async (
    creatorDID: string,
    beneficiaryDID:string,
    safeData: any,
    onChain: boolean,
    claimType: number,
    signalingPeriod: number
  ): Promise<string> => {
    try {
        let guardians: User[] = [];
        let txReceipt: TransactionReceipt | undefined

        //userQueryDid function
        const creatorUser: User[] = await queryUserDid(creatorDID)
        const beneficiaryUser: User[] = await queryUserDid(beneficiaryDID)


          const guardiansDid: string[] = await this.randomGuardians(creatorDID, beneficiaryDID);


          for(let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++){
              let guardianData: User = await this.getLoginUser(guardiansDid[guardianIndex]);
              guardians.push(guardianData)
          }


          const secretsData = this.crypto.generateSecrets(guardians)

          //note 1: Change here
          const signature: string = await this.signer.signMessage(ethers.utils.arrayify(secretsData.hash));


          const encryptedSafeData: EncryptedSafeData = await this.crypto.encryptSafeData(
            safeData,
            beneficiaryDID,
            this.connection.idx?.id,
            this.connection,
            guardiansDid,
            signature,
            secretsData.recoveryMessage,
            secretsData.secrets
            )
          //


          const data: SafeCreation = {
            creator: this.connection.idx?.id,
            guardians: guardiansDid,
            beneficiary: beneficiaryDID,
            encSafeKey: encryptedSafeData.creatorEncKey,
            encSafeData: encryptedSafeData.encryptedData,
            stage: safeStages.ACTIVE,
            encSafeKeyShards: encryptedSafeData.shardData,
            claims: [],
            onChain: onChain,
            claimType: claimType,
            signalingPeriod: signalingPeriod
          };

          const safe: string[] = await createSafe(data)

      if(onChain === true){
        const metaDataEvidenceUri:string = await createMetaData('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', creatorUser[0].userAddress);

        const arbitrationFee: number = await this.claims.arbitrator.getArbitrationFee()
        const guardianFee: number = 0.1;


        
        if(claimType === Types.ClaimType.ArbitrationBased){
          const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + guardianFee)))
          const tx: TransactionResponse = await this.claims.safientMain.createSafe(beneficiaryUser[0].userAddress, safe[0], claimType, signalingPeriod, metaDataEvidenceUri, totalFee)
          txReceipt = await tx.wait();
        }else if(claimType === Types.ClaimType.SignalBased){
          const totalFee: string = String(ethers.utils.parseEther(String(guardianFee)))
          const tx: TransactionResponse = await this.claims.safientMain.createSafe(beneficiaryUser[0].userAddress, safe[0], claimType, signalingPeriod , '', totalFee ) //NOTE: Change the time from 1 to required period here
          txReceipt = await tx.wait();
        }
        
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

            for(let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++){
              if(guardians[guardianIndex].safes.length === 0){
                guardians[guardianIndex].safes = [{
                  safeId: safe[0],
                  type: 'guardian'
                }]
              }else{
                guardians[guardianIndex].safes.push({
                  safeId: safe[0],
                  type: 'guardian'
              })
              }
          }

            await this.database.save(creatorUser[0], 'Users');
            await this.database.save(beneficiaryUser[0], 'Users')

          for(let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++){
            await this.database.save(guardians[guardianIndex], 'Users')
          }
      }

      if(txReceipt?.status === 0){
        await this.database.delete(safe[0], 'Users')
        console.log("Transaction Failed!");
      }

    return safe[0];

    } catch (err) {
      throw new Error(`Error while creating a safe. ${err}`);
    }
  };

 /**
  * This API returns the data of the safe.
  * @param safeId - ID of the safe being queried.
  * @returns - Encrypted Safe Data.
  */
  getSafeData = async (safeId: string): Promise<SafeData> => {
    try {
      const result: SafeData = await getSafeData(safeId)
      return result;
    } catch (err) {
      throw new Error("Error while fetching safe data");
    }
  };

  /**
   * This API allows for safe claiming for the beneficiary.
   * @param safeId - ID of the safe being claimed.
   * @param file - Evidence submitted with the claim.
   * @param evidenceName - Name of the evidence.
   * @param description - Decscription of the evidence and claim being submitted.
   * @returns - Dispute Number generated for the claim.
   */
  claimSafe = async (
    safeId: string,
    file: any,
    evidenceName: string,
    description: string
    ): Promise<number> => {
    try {
        
        let evidenceUri: string = ''
        let tx: TransactionResponse
        let disputeId:number = 0
        let txReceipt: any
        let createSafetx: TransactionResponse
        let createSafetxReceipt: TransactionReceipt
        let dispute: any

        const safe: SafeData = await this.getSafeData(safeId)
        let creatorUser:User[]  = await queryUserDid(safe.creator)

        if(safe.onChain === true && safe.stage === safeStages.ACTIVE){

          if(safe.claimType === Types.ClaimType.ArbitrationBased){
            evidenceUri = await createClaimEvidenceUri(file, evidenceName, description)
            tx = await this.claims.safientMain.createClaim(safe._id, evidenceUri)
            txReceipt = await tx.wait()
          }else if(safe.claimType === Types.ClaimType.SignalBased){
            tx = await this.claims.safientMain.createClaim(safe._id, '')
            txReceipt = await tx.wait()
          }
          
        }
      if(safe.onChain === false && safe.stage === safeStages.ACTIVE){

        const metaDataEvidenceUri:string = await createMetaData('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', creatorUser[0].userAddress);
        const arbitrationFee: number = await this.claims.arbitrator.getArbitrationFee()
        const guardianFee: number = 0.1;
        const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + guardianFee)))

        if(safe.claimType === Types.ClaimType.ArbitrationBased){
         createSafetx = await this.claims.safientMain.syncSafe(creatorUser[0].userAddress, safeId, safe.claimType, safe.signalingPeriod, metaDataEvidenceUri, totalFee,)
         createSafetxReceipt = await createSafetx.wait();
        }
        else{
           createSafetx = await this.claims.safientMain.syncSafe(creatorUser[0].userAddress, safeId, safe.claimType, safe.signalingPeriod, '', '') //Note update time here
           createSafetxReceipt = await createSafetx.wait();
        }
        if(createSafetxReceipt.status === 1){
          evidenceUri = await createClaimEvidenceUri(file, evidenceName, description)
          tx = await this.claims.safientMain.createClaim(safe._id, evidenceUri)
          txReceipt = await tx.wait()
        }
      }

      if(txReceipt.status === 1 && safe.stage === safeStages.ACTIVE){
        if(safe.claimType === Types.ClaimType.ArbitrationBased){
          dispute = txReceipt.events[2].args[2];
          disputeId = parseInt(dispute._hex);
        }else if(safe.claimType === Types.ClaimType.SignalBased){
          dispute = txReceipt.events[0].args[2];
          disputeId = parseInt(dispute._hex);
        }
        
        safe.stage = safeStages.CLAIMING

        if( safe.claims.length === 0){
          safe.claims = [{
                "createdBy": this.connection.idx?.id,
                "claimStatus": claimStages.ACTIVE,
                "disputeId": disputeId
            }]
        }else{
          safe.claims.push({
              "createdBy": this.connection.idx?.id,
              "claimStatus": claimStages.ACTIVE,
              "disputeId": disputeId
            })
        }
        await this.database.save(safe, 'Safes')
    }
      return disputeId;
    } catch (err) {
      throw new Error(`Error while creating a claim`);
    }
  };

  /**
   * This API is called by guardians when they have to recover the safe they are part of.
   * @param safeId - ID of the safe being recovered.
   * @param did - DID of the guardian.
   * @returns - True of False based on the recovery process.
   */
  guardianRecovery = async (safeId: string, did: string): Promise<boolean> => {
    try {
      const safe: SafeData = await this.getSafeData(safeId)
      const indexValue = safe.guardians.indexOf(did)
      let recoveryCount: number = 0;
      let recoveryStatus: boolean = false

      if(safe.stage === safeStages.RECOVERING) {
        const decShard = await this.connection.idx?.ceramic.did?.decryptDagJWE(
          safe.encSafeKeyShards[indexValue].encShard
        )
        safe.encSafeKeyShards[indexValue].status = 1
        safe.encSafeKeyShards[indexValue].decData = decShard

        safe.encSafeKeyShards.map((safeShard) => {
          if(safeShard.status === 1){
            recoveryCount = recoveryCount + 1;
          }
        })

        if(recoveryCount >= 2){
          safe.stage = safeStages.RECOVERED
        }else{
          safe.stage = safeStages.RECOVERING
        }
        recoveryStatus = true
        await this.database.save(safe, 'Safes')
      }
      else{
        recoveryStatus = false
      }

      return recoveryStatus;

      } catch (err) {
      throw new Error(`Error while guardian Recovery, ${err}`);
    }
  };

  /**
   * This API is for creator of the safe to recover safe data.
   * @param safeId - ID of the safe being recovered.
   * @returns - Decrypted Safe Data.
   */
  creatorSafeRecovery = async(safeId: string): Promise<any> =>{
    try{
      const safeData:SafeData = await this.getSafeData(safeId);
      const encSafeData = safeData.encSafeData
      const data = await this.crypto.decryptSafeData(safeData.encSafeKey, this.connection, encSafeData);
      const reconstructedData = JSON.parse(data.toString());
      return reconstructedData;
    }catch(err){
      throw new Error(`Error whole decrypting data, ${err}`)
    }
  }

 /**
  * This API updates the stages for a safe.
  * @ignore
  * @param safeId - ID of the safe being updated.
  * @param claimStage - The stage of the claim.
  * @param safeStage - The stage of the safe.
  * @returns - True or False based on update process.
  */
  private updateStage = async(safeId: string, claimStage: number, safeStage: number): Promise<boolean> => {
        try{

          const result:boolean = await updateStage(safeId, claimStage, safeStage)
          return result;

        }catch(err){
          throw new Error(`Error while updating a stage ${err}`)
        }
      }

    /**
     * This API decryptes safe data and enables recovery for the Beneficiary of the safe.
     * @param safeId - ID of the safe being recovered.
     * @param did - DID of the beneficiary.
     * @returns - Decrypted Safe Data.
     */
    beneficiarySafeRecovery = async (safeId: string, did: string): Promise<any> => {
        try {

          let shards: Object[] = [];
          let reconstructedSafeData: any;
          let safeData: any
          let result: any
          const safe: SafeData = await this.getSafeData(safeId)

          if(safe.stage === safeStages.RECOVERED || safe.stage === safeStages.CLAIMED){

            safe.encSafeKeyShards.map(share => {
              share.status === 1 ? shards.push(share.decData.share) : null
            })

            reconstructedSafeData = await this.crypto.reconstructSafeData(shards);
            safeData = await this.crypto.decryptSafeData(reconstructedSafeData.beneficiaryEncKey, this.connection, Buffer.from(safe.encSafeData))

            if(safeData !== undefined && safe.stage === safeStages.RECOVERED){
              await this.updateStage(safeId, claimStages.PASSED, safeStages.CLAIMED);
              result = JSON.parse(safeData.toString());
            }else{
              result = undefined
            }

          }

          return result

          } catch (err) {
          throw new Error(`Error while recovering data for Beneficiary, ${err}`);
        }
      };

      
      /**
       * This function is used to get onChain safe data.
       * @ignore
       * @param safeId -ID of the safe. 
       * @returns - onChain Safe Data
       */
      getOnChainData = async (safeId: string) => {
        try{
          const data = await this.claims.safientMain.getSafeBySafeId(safeId)
          return data
        }catch(err){
          throw new Error('Error while getting onChain data')
        }
      }
      
      /**
       * This API gets claim data for the safe from onChain.
       * @ignore
       * @param claimId - onChain dispute/claim ID
       * @returns - Claim information.
       */
      getOnChainClaimData = async(claimId: number) => {
        try{
          const data = await this.claims.safientMain.getClaimByClaimId(claimId)
          return data;
        }catch(err){
          throw new Error(`Error while getting onChain claim data ${err}`)
        }

      }

      
      /**
       * This API get's status of the claim.
       * @param safeId - ID of the safe.
       * @param claimId - Claim/Dispute ID of the safe.
       * @returns - The status of the safe claim.
       */
      getStatus = async(safeId: string, claimId: number) => {
        try{
          const claimStage = await this.claims.safientMain.getClaimStatus(safeId, claimId);
          return claimStage;
        }catch(err){
          throw new Error(`Error while getting onChain claim data ${err}`)
        }

      }

      /**
       * This API syncs onChain and offChain stages of the safe. 
       * @ignore
       * @param safeId - ID of the safe.
       * @returns - True or False based on the sync process.
       */
      syncStage = async(safeId: string): Promise<boolean> => {
        try{
          
          let disputeId: number = 0
          let claimIndex : number = 0
          const safe: SafeData = await this.getSafeData(safeId)

          const claims = safe.claims
          claims.map((claim,index) => {
            if(claim.claimStatus === claimStages.ACTIVE){
              disputeId = claim.disputeId;
              claimIndex = index
            }
          })
          const claimStage = await this.claims.safientMain.getClaimStatus(safeId, disputeId);
          if(claimStage === claimStages.PASSED){
            safe.stage = safeStages.RECOVERING;
            safe.claims[claimIndex].claimStatus = claimStages.PASSED;
          }
          if(claimStage === claimStages.FAILED || claimStage === claimStages.REJECTED){
            safe.stage = safeStages.ACTIVE;
            safe.claims[claimIndex].claimStatus = claimStage;
          }

          await this.database.save(safe, 'Safes')
          return true;
        }catch(err){
          throw new Error(`Error while syncing stage data, ${err}`)
        }

      }


      /**
       * @ignore
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

      /**
       * The API is used to send signal to the safe onChain.
       * @param safeId - ID of the safe.
       * @returns - Transaction details of the signal.
       */
      sendSignal = async(safeId: string): Promise<TransactionReceipt> => {
        try{
           const tx: TransactionResponse = await this.claims.safientMain.sendSignal(safeId)
           const txReceipt: TransactionReceipt = await tx.wait()
           if(txReceipt.status === 1){
            await this.updateStage(safeId, claimStages.ACTIVE, safeStages.ACTIVE);
           }
          return txReceipt;
        }catch(err){
          throw new Error(`Error while sending a signal, ${err}`)
        }

      }



      /**
       * This API is used by guardians to claim the incentivisation. 
       * @param safeId - ID of the safe.
       * @returns - True or false based on the incentivisation process.
       */
      incentiviseGuardians = async(safeId: string): Promise<boolean> =>{
        try{
          
          let shards: any = []
          let guardianArray: any = [];
          let guardianSecret: string[] = [];
          let tx: boolean = false

          const safe: SafeData = await this.getSafeData(safeId)

            if(safe.stage === safeStages.CLAIMED){
              safe.encSafeKeyShards.map((share) => {
                  if(share.status === 1){
                    shards.push(share.decData.share)
                    guardianSecret.push(share.decData.secret);
                  }
                })

                if(shards.length !== 0){
                  const reconstructedData: Share = await this.crypto.reconstructSafeData([Buffer.from(shards[0]), Buffer.from(shards[1])])
                  const message = reconstructedData.message;
                  message.data.guardians.map((guardian: any) => {
                    const guardianTuple = [guardian.secret, guardian.address]
                    guardianArray.push(guardianTuple);
                  })

                  tx = await this.claims.safientMain.guardianProof(
                    JSON.stringify(message),
                    reconstructedData.signature,
                    guardianArray,
                    guardianSecret,
                    safeId
                    )
                }
            }

            return tx

        }catch(e){
          throw new Error(`Error while incentiving the guardians ${e}`)
        }
      }


}
