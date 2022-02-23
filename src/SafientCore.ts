import { IDX } from '@ceramicstudio/idx';
import { JsonRpcProvider, TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { SafientMain, Arbitrator, Types } from '@safient/contracts';
import { BigNumber, ethers } from 'ethers';

import {
  Connection,
  User,
  UserMeta,
  Safe,
  SafeCreation,
  Share,
  SafeEncrypted,
  UserSchema,
  Utils,
  Signer,
  UserResponse,
  SafeRecovered,
  SafeStore,
  GenericError,
  DecShard,
  CeramicDefintions,
  ClaimResponse,
  EventResponse,
} from './lib/types';
import { definitions } from './utils/config.json';
import {
  createClaimEvidenceUri,
  createMetaData,
  createSafe,
  generateRandomGuardians,
  getUser,
  getSafeData,
  getUsers,
  init,
  queryUserDid,
  updateStage,
  createUser,
  deleteDecShard,
  updateDecShard,
  getDecShards,
} from './logic/index';
import { Database } from './database';
import { Crypto } from './crypto';
import { Auth, Signature } from './identity';
import { ClaimStages, DatabaseType, NetworkType, SafeStages } from './lib/enums';
import { Networks } from './utils/networks';
import {SafientResponse} from './lib/services'
import {Errors} from "./lib/errors"
require('dotenv').config();

export class SafientCore {
  /** @ignore */
  private signer: Signer;
  /** @ignore */
  private provider: JsonRpcProvider;
  /** @ignore */
  private contract: SafientMain;
  /**@ignore */
  private arbitrator: Arbitrator;
  /** @ignore */
  private connection: Connection;
  /** @ignore */
  private crypto: Crypto;
  /** @ignore */
  private database: Database;
  /** @ignore */
  private databaseType: DatabaseType;
  /** @ignore */
  private Utils: Utils;
  /** @ignore */
  private auth: Auth;
  /** @ignore */
  private signature: Signature;
  /**@ignore */
  private apiKey: any;
  /**@ignore */
  private apiSecret: any;
  /**@ignore */
  private threadId: number[];
  /**@ignore */
  private chainId: number;
  /**@ignore */
  private CERAMIC_URL: string
  /**@ignore */
  private ceramicDefintions: CeramicDefintions
  /**@ignore */
  private guardianFee: number = 0.1;
  

  /**
   * Constructor to initilize the Core SDK
   * @param signer Signer object of the wallet
   * @param network The type of network from NetworkType Enum
   * @param databaseType Type of database to use
   * @param databaseAPIKey Database API key
   * @param databaseAPISecret Database API secret
   * @param threadId ThreadDB ID if its available (optional)
   */
  constructor(
    signer: Signer,
    network: NetworkType,
    databaseType: DatabaseType,
    databaseAPIKey: any,
    databaseAPISecret: any,
    threadId?: number[]
  ) {

    this.signer = signer;
    this.provider = this.provider;
    this.chainId = Networks[network].chainId;
    this.CERAMIC_URL = Networks[network].ceramic.CERAMIC_URL
    this.ceramicDefintions = Networks[network].ceramic.config
    if (!threadId) {
      this.threadId = Networks[network].threadId;
    } else {
      this.threadId = threadId!;
    }
    this.contract = new SafientMain(signer, this.chainId);
    this.arbitrator = new Arbitrator(signer, this.chainId);
    this.apiKey = databaseAPIKey;
    this.apiSecret = databaseAPISecret;
    this.databaseType = databaseType;
    this.auth = new Auth();
    this.signature = new Signature(signer);
  }

  /**
   * This API generates user ceramic and database connection object
   * @returns Connection datatype
   */
  loginUser = async (): Promise<SafientResponse<User>> => {
    try {

      const seed = await this.signature.sign();
      const { idx, ceramic } = await this.auth.generateIdentity(Uint8Array.from(seed), this.CERAMIC_URL, this.ceramicDefintions);
      const { client, threadId } = await this.auth.generateThread(seed, this.apiKey, this.apiSecret, this.threadId);
      const connectionData = { client, threadId, idx };
      this.connection = connectionData;
      this.Utils = init(this.databaseType, this.connection);
      this.crypto = this.Utils.crypto;
      this.database = this.Utils.database;
      const userData: SafientResponse<User> = await this.getUser({ did: idx?.id });
      if (userData.data) {
       return userData
      } else {
         throw new SafientResponse({error: Errors.UserNotFound})
      }
    } catch (err) {
      if(err instanceof SafientResponse){
        throw new SafientResponse({error: err.error});
      }else{
        const {message} = err as Error
        throw new SafientResponse({error: {code: 0 , message: message}});
      }
    }
  };

  /**
   * This API registers users onto the platform
   * @param name  Name of the user
   * @param email Email of the user
   * @param signUpMode Signup mode (0 - Metamask, 1 - Social Login)
   * @param userAddress Metamask address of the user
   * @returns User registration ID
   */
  createUser = async (name: string, email: string, signUpMode: number, userAddress: string, guardian: boolean): Promise<SafientResponse<User>> => {
    try {
     

      let idx: IDX | null = this.connection.idx;
      let did: string = idx?.id || '';

      const data: UserSchema = {
        did,
        name,
        email,
        safes: [],
        signUpMode,
        userAddress,
        guardian
      };

      const result: UserResponse = await createUser(data, this.connection.idx?.id!);
      if (result.status === false) {
        const ceramicResult = await idx?.set(this.ceramicDefintions.definitions.profile, {
          name: name,
          email: email,
        });
        return new SafientResponse({data: result.data!}) 
      } else {
        throw new SafientResponse({error: Errors.UserAlreadyExists}) 
      }

    } catch (err) {
      if(err instanceof SafientResponse){
        throw new SafientResponse({error: err.error});
      }else{
        const {message} = err as Error
        throw new SafientResponse({error: {code: 0 , message: message}});
      }
    }
  };

  /**
   * This API is used to get the login information of the user
   * @param obj Takes email or did as parameter to get the user information
   * @returns User or null based on user information present
   */
  getUser = async (obj: { email?: string; did?: string }): Promise<SafientResponse<User>> => {
    try {
      
      let user: User | null = null;
      if (obj.did) {
        user = await getUser({ did: obj.did });
      } else if (obj.email) {
        user = await getUser({ email: obj.email });
      }
      if (user) {
       return new SafientResponse({data: user})
      } else {
        throw new SafientResponse({error: Errors.UserNotFound})
      }
    } catch (err) {
      if(err instanceof SafientResponse){
        throw new SafientResponse({error: err.error});
      }else{
        const {message} = err as Error
        throw new SafientResponse({error: {code: 0 , message: message}});
      }
    }
  };

  /**
   * This API is used to get all the user basic information on the platform
   * @returns Array of users on the platform
   */
  getUsers = async (): Promise<SafientResponse<UserMeta[]>> => {
    try {
      const users: UserMeta[] = await getUsers();
      return new SafientResponse({data: users});
    } catch (err) {
        const {message} = err as Error
        throw new SafientResponse({error: {code: 0 , message: message}});
    }
  };

  /**
   * This API is used to select random guardians from the platform for a safe
   * @ignore
   * @param creatorDID DID of the safe creator
   * @param beneficiaryDID DID of the safe beneficiary
   * @returns Array of guardian DIDs
   */
  private randomGuardians = async (creatorDID: string | any, beneficiaryDID: string | any): Promise<string[]> => {
    try {
      const guardians: string[] = await generateRandomGuardians(creatorDID, beneficiaryDID);
      return guardians;
    } catch (err) {
      throw new Error(`Couldn't fetch random guardians, ${err}`);
    }
  };

  /**
   * This API is used to create a safe either onChain or offChain
   * @param creatorDID DID of the user who creates the safe
   * @param beneficiaryDID DID of the user who inherits the safe
   * @param safeData Data being stored in the safe
   * @param onChain The data to be stored onChain or offChain
   * @param claimType The safe is claimed through either "Arbitration" or "Signal" (Arbitration - 0, Signal - 1)
   * @param signalingPeriod signalingPeriod The time window in seconds within which the creator wants to signal the safe in response to a claim on the safe
   * @param dDay The timestamp in unix epoch milliseconds after which the beneficiary can directly claim the safe
   * @returns ID generated for the Safe
   */
  createSafe = async (
    safeName: string,
    description: string,
    creatorDID: string,
    beneficiaryDID: string,
    safeData: SafeStore,
    onChain: boolean,
    claimType: number,
    signalingPeriod: number,
    dDay: number
  ): Promise<SafientResponse<EventResponse>> => {
    try {
      
      let guardians: User[] = [];
      let txReceipt: TransactionReceipt | undefined;

      //userQueryDid function
      const creatorUser: User[] = await queryUserDid(creatorDID);
      const beneficiaryUser: User[] = await queryUserDid(beneficiaryDID);
      const guardiansDid: string[] = await this.randomGuardians(creatorDID, beneficiaryDID);
      if(creatorDID !== beneficiaryDID){
        if (guardiansDid.length > 1) {
          for (let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++) {
            try{  
              let guardianData: SafientResponse<User> = await this.getUser({ did: guardiansDid[guardianIndex] });
              guardians.push(guardianData.data!);
            }catch(err){
              if(err instanceof SafientResponse){
                if(err.error?.code === Errors.UserNotFound.code)
                throw new SafientResponse({error: Errors.GuardianNotFound});
              }
            }
           
          }
  
          const secretsData = this.crypto.generateSecrets(guardians);
  
          //note 1: Change here
          const signature: string = await this.signer.signMessage(ethers.utils.arrayify(secretsData.hash));
  
          const encryptedSafeData: SafeEncrypted = await this.crypto.encryptSafeData(
            safeData,
            beneficiaryDID,
            this.connection.idx?.id,
            this.connection,
            guardiansDid,
            signature,
            secretsData.recoveryMessage,
            secretsData.secrets
          );
  
          const data: SafeCreation = {
            safeName: safeName,
            description: description,
            creator: this.connection.idx?.id,
            guardians: guardiansDid,
            beneficiary: beneficiaryDID,
            encSafeKey: encryptedSafeData.creatorEncKey,
            encSafeData: encryptedSafeData.encryptedData,
            stage: SafeStages.ACTIVE,
            encSafeKeyShards: encryptedSafeData.shardData,
            claims: [],
            onChain: onChain,
            claimType: claimType,
            signalingPeriod: signalingPeriod,
            dDay: dDay,
            timeStamp: Date.now(),
            proofSubmission: false
          };
  
          const safe: string[] = await createSafe(data);
  
          if (onChain === true) {
            const metaDataEvidenceUri: string = await createMetaData(
              '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
              creatorUser[0].userAddress
            );
  
            const arbitrationFee: number = await this.arbitrator.getArbitrationFee();
      
  
            if (claimType === Types.ClaimType.ArbitrationBased) {
              const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + this.guardianFee)));
              const tx: TransactionResponse = await this.contract.createSafe(
                beneficiaryUser[0].userAddress,
                safe[0],
                claimType,
                signalingPeriod,
                dDay,
                metaDataEvidenceUri,
                totalFee
              );
              txReceipt = await tx.wait();
            } else if (claimType === Types.ClaimType.SignalBased || claimType === Types.ClaimType.DDayBased) {
              const totalFee: string = String(ethers.utils.parseEther(String(this.guardianFee)));
              const tx: TransactionResponse = await this.contract.createSafe(
                beneficiaryUser[0].userAddress,
                safe[0],
                claimType,
                signalingPeriod,
                dDay,
                '',
                totalFee
              ); //NOTE: Change the time from 1 to required period here
              txReceipt = await tx.wait();
            }
          }
  
          if (txReceipt?.status === 1 || onChain === false) {
            if (creatorUser[0].safes.length === 0) {
              creatorUser[0].safes = [
                {
                  safeId: safe[0],
                  type: 'creator',
                  decShard: null
                },
              ];
            } else {
              creatorUser[0].safes.push({
                safeId: safe[0],
                type: 'creator',
                decShard: null
              });
            }
  
            if (beneficiaryUser[0].safes.length === 0) {
              beneficiaryUser[0].safes = [
                {
                  safeId: safe[0],
                  type: 'beneficiary',
                  decShard: null
                },
              ];
            } else {
              beneficiaryUser[0].safes.push({
                safeId: safe[0],
                type: 'beneficiary',
                decShard: null
              });
            }
  
            for (let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++) {
              if (guardians[guardianIndex].safes.length === 0) {
                guardians[guardianIndex].safes = [
                  {
                    safeId: safe[0],
                    type: 'guardian',
                    decShard: null
                  },
                ];
              } else {
                guardians[guardianIndex].safes.push({
                  safeId: safe[0],
                  type: 'guardian',
                  decShard: null
                });
              }
            }
  
            await this.database.save(creatorUser[0], 'Users');
            await this.database.save(beneficiaryUser[0], 'Users');
  
            for (let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++) {
              await this.database.save(guardians[guardianIndex], 'Users');
            }
          }
  
          if (txReceipt?.status === 0) {
            await this.database.delete(safe[0], 'Users');
            console.log('Transaction Failed!');
            throw new SafientResponse({error: Errors.TransactionFailure})
          }
          const result: EventResponse = {
            id: safe[0],
            recepient: {
                name: beneficiaryUser[0].name,
                email: beneficiaryUser[0].email,
                phone: '',
              }
          }
          return new SafientResponse({data: result})
        } else {
         throw new SafientResponse({error: Errors.SafeNotCreated})
        }
      }else{
        throw new SafientResponse({error: Errors.SelfSafeCreation})
      }
     
    } catch (err) {
      if(err instanceof SafientResponse){
        throw new SafientResponse({error: err.error});
      }else{
        const {message} = err as Error
        throw new SafientResponse({error: {code: 0 , message: message}});
      }
    }
  };

  /**
   * This API returns the data of the safe
   * @param safeId ID of the safe being queried
   * @returns Encrypted Safe Data
   */
  getSafe = async (safeId: string): Promise<SafientResponse<Safe>> => {
    try {  
      const result: Safe = await getSafeData(safeId);
      // TODO: Need to move the different function
      if(result.stage === SafeStages.CLAIMING){
        const claimStatus = await this.getClaimStatus(safeId, result.claims[result.claims.length - 1].disputeId)
        result.claims[result.claims.length - 1].claimStatus = claimStatus
        if(claimStatus === ClaimStages.PASSED){
          result.stage = SafeStages.RECOVERING
        }else{
          result.stage = SafeStages.ACTIVE
        }
      }
      return new SafientResponse({data: result});
    } catch (err) {
      throw new SafientResponse({error: Errors.SafeNotFound})
    }
  };

  /**
   * This API allows for safe claiming for the beneficiary
   * @param safeId ID of the safe being claimed
   * @param file Evidence submitted with the claim
   * @param evidenceName Name of the evidence
   * @param description Decscription of the evidence and claim being submitted
   * @returns Dispute Number generated for the claim
   */
  createClaim = async (safeId: string, file: any, evidenceName: string, description: string): Promise<SafientResponse<EventResponse>> => {
    try {
      let evidenceUri: string = '';
      let tx: TransactionResponse;
      let disputeId: number = 0;
      let txReceipt: any;
      let createSafetx: TransactionResponse;
      let createSafetxReceipt: any;
      let dispute: any;
      let timeStamp: number = 0;
      const userBalance: BigNumber = await this.signer.getBalance()
      let etherBalance = ethers.utils.formatEther(userBalance)

      let safeData: SafientResponse<Safe> = await this.getSafe(safeId);
      const safe = safeData.data!;
      let creatorUser: User[] = await queryUserDid(safe.creator);
      
      if(parseInt(etherBalance) >= 0.1){
        if (safe.onChain === true ) {
          if (safe.claimType === Types.ClaimType.ArbitrationBased) {
            if (safe.stage === SafeStages.ACTIVE) {
              evidenceUri = await createClaimEvidenceUri(file, evidenceName, description);
              tx = await this.contract.createClaim(safe._id, evidenceUri);
              txReceipt = await tx.wait();
            }
          } else if (safe.claimType === Types.ClaimType.SignalBased) {
            if (safe.stage === SafeStages.ACTIVE) {
              tx = await this.contract.createClaim(safe._id, '');
              txReceipt = await tx.wait();
            }
          } else if (safe.claimType === Types.ClaimType.DDayBased) {
            tx = await this.contract.createClaim(safe._id, '');
            txReceipt = await tx.wait();
          }
        }
  
        if (safe.onChain === false) {
          const metaDataEvidenceUri: string = await createMetaData(
            '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            creatorUser[0].userAddress
          );
  
          if (safe.claimType === Types.ClaimType.ArbitrationBased) {
            if (safe.stage === SafeStages.ACTIVE) {
              const arbitrationFee: number = await this.arbitrator.getArbitrationFee();
              const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + this.guardianFee)));
              createSafetx = await this.contract.syncSafe(
                creatorUser[0].userAddress,
                safeId,
                safe.claimType,
                safe.signalingPeriod,
                safe.dDay,
                metaDataEvidenceUri,
                totalFee
              );
              createSafetxReceipt = await createSafetx.wait();
            }
          } else if (safe.claimType === Types.ClaimType.SignalBased) {
            if (safe.stage === SafeStages.ACTIVE) {
              const totalFee: string = String(ethers.utils.parseEther(String(this.guardianFee)));
              createSafetx = await this.contract.syncSafe(
                creatorUser[0].userAddress,
                safeId,
                safe.claimType,
                safe.signalingPeriod,
                safe.dDay,
                '',
                totalFee
              ); //Note update time here
              createSafetxReceipt = await createSafetx.wait();
            }
          } else if (safe.claimType === Types.ClaimType.DDayBased) {
            const totalFee: string = String(ethers.utils.parseEther(String(this.guardianFee)));
            createSafetx = await this.contract.syncSafe(
              creatorUser[0].userAddress,
              safeId,
              safe.claimType,
              safe.signalingPeriod,
              safe.dDay,
              '',
              totalFee
            ); //Note update time here
            createSafetxReceipt = await createSafetx.wait();
          }
  
          if (createSafetxReceipt.status === 1) {
            evidenceUri = await createClaimEvidenceUri(file, evidenceName, description);
            if (safe.claimType === Types.ClaimType.ArbitrationBased) {
              tx = await this.contract.createClaim(safe._id, evidenceUri);
            } else {
              tx = await this.contract.createClaim(safe._id, '');
            }
            txReceipt = await tx.wait();
          }
        }
  
        if (txReceipt.status === 1) {
          if (safe.claimType === Types.ClaimType.ArbitrationBased) {
            if (safe.stage === SafeStages.ACTIVE) {
              dispute = txReceipt.events[2].args[1];
              timeStamp = parseInt(txReceipt.events[2].args[2]._hex)
              disputeId = parseInt(dispute._hex);
            }
          } else if (safe.claimType === Types.ClaimType.SignalBased) {
            if (safe.stage === SafeStages.ACTIVE) {
              dispute = txReceipt.events[0].args[1];
              timeStamp = parseInt(txReceipt.events[0].args[2]._hex)
              disputeId = parseInt(dispute._hex);
            }
          } else if (safe.claimType === Types.ClaimType.DDayBased) {
            dispute = txReceipt.events[0].args[1];
            timeStamp = parseInt(txReceipt.events[0].args[2]._hex)
            disputeId = parseInt(dispute._hex);
          }
  
          safe.stage = SafeStages.CLAIMING;
  
          if (safe.claims.length === 0) {
            safe.claims = [
              {
                createdBy: this.connection.idx?.id,
                claimStatus: ClaimStages.ACTIVE,
                disputeId: disputeId,
                timeStamp: timeStamp
              },
            ];
          } else {
            safe.claims.push({
              createdBy: this.connection.idx?.id,
              claimStatus: ClaimStages.ACTIVE,
              disputeId: disputeId,
              timeStamp: timeStamp
            });
          }
          await this.database.save(safe, 'Safes');
        }

        const claimResponse: EventResponse = {
         id: dispute.toString(),
         recepient: {
           name: creatorUser[0].name,
           email: creatorUser[0].email,
           phone: ''
         }
        }
        return new SafientResponse({data: claimResponse});
      }else{
        throw new SafientResponse({error: Errors.WalletBalance})
      }
      
    } catch (err) {
      throw new SafientResponse({error: Errors.ClaimNotCreated})
    }
  };



  /**
   * This API is called by guardians when they have to recover the safe they are part of
   * @param safeId ID of the safe being recovered
   * @param did DID of the guardian
   * @returns True of False based on the recovery process
   */
  reconstructSafe = async (safeId: string, did: string): Promise<SafientResponse<boolean>> => {
    try {
      const safeData: SafientResponse<Safe> = await this.getSafe(safeId);
      const safe = safeData.data!;
      const indexValue = safe.guardians.indexOf(did);
      let recoveryStatus: boolean = false;
      // internal function 
      const res = await this.syncStage(safeId)

      if (res.data === true && safe.stage === SafeStages.RECOVERING) {
        const decShard: DecShard = await this.connection.idx?.ceramic.did?.decryptDagJWE(
          safe.encSafeKeyShards[indexValue].data
        ) as DecShard;

        await updateDecShard(did, safeId, decShard)
        
        const decShards: DecShard[] = await getDecShards(safe.guardians, safeId)
        if (decShards.length >= 2) {
          safe.stage = SafeStages.RECOVERED;
          safe.decSafeKeyShards = decShards
          await deleteDecShard(safe.guardians, safeId)

        } else {
          safe.stage = SafeStages.RECOVERING;
        }
        recoveryStatus = true;
        await this.database.save(safe, 'Safes');
      } else {
        recoveryStatus = false;
      }

      return new SafientResponse({data: recoveryStatus});
    } catch (err) {
      throw new SafientResponse({error: Errors.GuardianRecoveryFailure})
    }
  };

  /**
   * This API is for creator of the safe to recover safe data
   * @param safeId ID of the safe being recovered
   * @returns Decrypted Safe Data
   */
  recoverSafeByCreator = async (safeId: string): Promise<SafientResponse<any>> => {
    try {
      let recoveredData: SafeRecovered = {
        status: false,
        data: null,
      };
      const safeData: SafientResponse<Safe> = await this.getSafe(safeId);
      const encSafeData = safeData.data!.encSafeData;
      const data = await this.crypto.decryptSafeData(safeData.data!.encSafeKey, this.connection, encSafeData);
      const reconstructedData = JSON.parse(data.toString());
      recoveredData = {
        status: true,
        data: reconstructedData,
      };
      return new SafientResponse({data: reconstructedData});
    } catch (err) {
      throw new SafientResponse({error: Errors.CreatorRecoveryFailure})
    }
  };

  /**
   * This API updates the stages for a safe
   * @ignore
   * @param safeId ID of the safe being updated
   * @param claimStage The stage of the claim
   * @param safeStage The stage of the safe
   * @returns True or False based on update process
   */
  private updateStage = async (safeId: string, claimStage: number, safeStage: number): Promise<SafientResponse<boolean>> => {
    try {
      const result: boolean = await updateStage(safeId, claimStage, safeStage);
      return new SafientResponse({data: result});
    } catch (err) {
      throw new Error(`Error while updating a stage ${err}`);
    }
  };

  /**
   * This API decryptes safe data and enables recovery for the Beneficiary of the safe
   * @param safeId ID of the safe being recovered
   * @param did DID of the beneficiary
   * @returns Decrypted Safe Data
   */
  recoverSafeByBeneficiary = async (safeId: string, did: string): Promise<any> => {
    try {
      let recoveredData: SafeRecovered = {
        status: false,
        data: null,
      };
      let shards: Object[] = [];
      let reconstructedSafeData: any;
      let safeData: any;
      let result: any;
      const safeResponse: SafientResponse<Safe> = await this.getSafe(safeId);
      const safe = safeResponse.data!;

      if (safe.stage === SafeStages.RECOVERED || safe.stage === SafeStages.CLAIMED) {
        const decShards: DecShard[] =  safe.decSafeKeyShards
        decShards.map((shard) => {
          shards.push(shard.share);
        });

        reconstructedSafeData = await this.crypto.reconstructSafeData(shards);
        safeData = await this.crypto.decryptSafeData(
          reconstructedSafeData.beneficiaryEncKey,
          this.connection,
          Buffer.from(safe.encSafeData)
        );

        if (safeData && safe.stage === SafeStages.RECOVERED) {
          await this.updateStage(safeId, ClaimStages.PASSED, SafeStages.CLAIMED);
          result = JSON.parse(safeData.toString());
          return new SafientResponse({data: result.data})
        }else if(safeData && safe.stage === SafeStages.CLAIMED){
          result = JSON.parse(safeData.toString());
          return new SafientResponse({data: result.data})
        } 
        else {
          throw new SafientResponse({error: Errors.BeneficiaryRecoveryFailure})
        }
      }else {
        throw new SafientResponse({error: Errors.StageNotUpdated})
      }
    } catch (err) {
      if(err instanceof SafientResponse){
        if(err.error?.code === Errors.StageNotUpdated.code){
          throw new SafientResponse({error: Errors.StageNotUpdated})
        }else{
          throw new SafientResponse({error: Errors.BeneficiaryRecoveryFailure})
        }
      }
    }
  };

  /**
   * This function is used to get onChain safe data
   * @param safeId ID of the safe
   * @returns onChain Safe Data
   */
  getOnChainData = async (safeId: string) => {
    try {
      const data = await this.contract.getSafeBySafeId(safeId);
      return data;
    } catch (err) {
      throw new SafientResponse({error: Errors.OnChainSafeNotFound})
    }
  };

  /**
   * This API gets claim data for the safe from onChain
   * @param claimId onChain claimId
   * @returns Claim information
   */
  getOnChainClaimData = async (claimId: number) => {
    try {
      const data = await this.contract.getClaimByClaimId(claimId);
      return data;
    } catch (err) {
      throw new SafientResponse({error: Errors.OnChainSafeNotFound})
    }
  };

  /**
   * This API get's status of the claim
   * @param safeId ID of the safe
   * @param claimId Claim/Dispute ID of the safe
   * @returns The status of the safe claim
   */
  getClaimStatus = async (safeId: string, claimId: number) => {
    try {
      const claimStage = await this.contract.getClaimStatus(safeId, claimId);
      return claimStage;
    } catch (err) {
      throw new SafientResponse({error: Errors.OnChainClaimStatus})
    }
  };

  /**
   * This API syncs onChain and offChain stages of the safe
   * @ignore
   * @param safeId ID of the safe.
   * @returns True or False based on the sync process
   */
  syncStage = async (safeId: string): Promise<SafientResponse<boolean>> => {
    try {
      let disputeId: number = 0;
      let claimIndex: number = 0;
      const safeData: SafientResponse<Safe> = await this.getSafe(safeId);
      const safe = safeData.data!;
      const claims = safe.claims;

      claims.map((claim, index) => {
        if (claim.claimStatus === ClaimStages.ACTIVE) {
          disputeId = claim.disputeId;
          claimIndex = index;
        }
      });
      const claimStage = await this.contract.getClaimStatus(safeId, disputeId);
      if (claimStage === ClaimStages.PASSED) {
        safe.stage = SafeStages.RECOVERING;
        safe.claims[claimIndex].claimStatus = ClaimStages.PASSED;
      }
      if (claimStage === ClaimStages.FAILED || claimStage === ClaimStages.REJECTED) {
        safe.stage = SafeStages.ACTIVE;
        safe.claims[claimIndex].claimStatus = claimStage;
      }

      await this.database.save(safe, 'Safes');
      return new SafientResponse({data: true});
    } catch (err) {
      throw new SafientResponse({error: Errors.SyncStageFailure})
    }
  };

  /**
   * @ignore
   * Disclaimer: Internal API only. Not production API
   * Use at your loss
   * If you reading this code and come across this, be warned not to use this at all
   *  */
  giveRuling = async (disputeId: number, ruling: number): Promise<SafientResponse<boolean>> => {
    try {
      const result: boolean = await this.arbitrator.giveRulingCall(disputeId, ruling);
      return new SafientResponse({data: result});
    } catch (err) {
      throw new SafientResponse({error: Errors.RulingFailure})
    }
  };

  /**
   * The API is used to send signal to the safe onChain
   * @param safeId ID of the safe
   * @returns Transaction details of the signal
   */
  createSignal = async (safeId: string): Promise<SafientResponse<TransactionReceipt>> => {
    try {
      const tx: TransactionResponse = await this.contract.sendSignal(safeId);
      const txReceipt: TransactionReceipt = await tx.wait();
      if (txReceipt.status === 1) {
        await this.updateStage(safeId, ClaimStages.ACTIVE, SafeStages.ACTIVE);
      }

      return new SafientResponse({data: txReceipt});
    } catch (err) {
      throw new SafientResponse({error: Errors.SignalCreateFailure})
    }
  };

  /**
   * This API is used by guardians to claim the incentivisation
   * @param safeId ID of the safe
   * @returns True or false based on the incentivisation process
   */
  incentiviseGuardians = async (safeId: string): Promise<SafientResponse<boolean>> => {
    try {
      let shards: any = [];
      let guardianArray: any = [];
      let guardianSecret: string[] = [];
      let txResponse: TransactionResponse
      let txReceipt: TransactionReceipt | undefined

      const safeData: SafientResponse<Safe> = await this.getSafe(safeId);
      const safe = safeData.data!;
      if (!safe.proofSubmission && safe.decSafeKeyShards.length >= 2) {
        const decShards: DecShard[] = safe.decSafeKeyShards
        decShards.map((shard) => {
            shards.push(shard.share);
            guardianSecret.push(shard.secret);
        });

        if (shards.length !== 0) {
          const reconstructedData: Share = await this.crypto.reconstructSafeData([
            Buffer.from(shards[0]),
            Buffer.from(shards[1]),
          ]);
          const message = reconstructedData.message;
          message.data.guardians.map((guardian: any) => {
            const guardianTuple = [guardian.secret, guardian.address];
            guardianArray.push(guardianTuple);
          });

          txResponse = await this.contract.guardianProof(
            JSON.stringify(message),
            reconstructedData.signature,
            guardianArray,
            guardianSecret,
            safeId
          );
          txReceipt = await txResponse.wait();
        }
        if(txReceipt?.status){
          safe.proofSubmission = true
          await this.database.save(safe, "Safes")
          return new SafientResponse({data: true});
        }else{
          throw new SafientResponse({error: Errors.IncentivizationFailure})
        }
      }else{
        throw new SafientResponse({error: Errors.IncentivizationComplete})
      }
    } catch (err) {
      if(err instanceof SafientResponse){
        if(err.error?.code === Errors.IncentivizationComplete.code){
          throw new SafientResponse({error: Errors.IncentivizationComplete})
        }
      }
      throw new SafientResponse({error: Errors.IncentivizationFailure})
    }
  };

 
  /**
   * This function returns the total guardian reward balance of a guardian
   * @param address The address of the guardian
   * @returns The total guardian reward balance in ETH
   */
  getRewardBalance = async (address: string): Promise<SafientResponse<Number>> => {
    try {
      const result: Number = await this.contract.getGuardianRewards(address);
      return new SafientResponse({data: result});
    } catch (e) {
      throw new SafientResponse({error: Errors.RewardsAccessFailure})
    }
  };

  /**
   * This function allows the guardians to claim their rewards
   * @param funds Total funds need to be claimed in ETH
   * @returns A transaction response
   */
  claimRewards = async (funds: number): Promise<TransactionResponse> => {
    try {
      const result: TransactionResponse = await this.contract.claimRewards(funds);
      return result;
    } catch (e) {
      throw new SafientResponse({error: Errors.RewardsClaimFailure})
    }
  };

  /**
   * This function updates the D-Day of a safe
   * @param safeId ID of the safe
   * @param dDay The timestamp in unix epoch milliseconds after which the beneficiary can directly claim the safe
   * @returns A transaction response
   */
  updateDDay = async (safeId: string, dDay: number): Promise<TransactionResponse> => {
    try {
      const result: TransactionResponse = await this.contract.updateDDay(safeId, dDay);
      return result;
    } catch (e) {
      throw new SafientResponse({error: Errors.DDayUpdateFailure})
    }
  };
}
