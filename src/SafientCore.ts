import { IDX } from '@ceramicstudio/idx';
import { JsonRpcProvider, TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { SafientMain, Arbitrator, Types } from '@safient/contracts';
import { ethers } from 'ethers';

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
  SafeResponse,
  SafeCreationResponse,
  SafeStore,
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
} from './logic/index';
import { Database } from './database';
import { Crypto } from './crypto';
import { Auth, Signature } from './identity';
import { ClaimStages, DatabaseType, NetworkType, SafeStages } from './lib/enums';
import { Networks } from './utils/networks';

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
    if (threadId === undefined) {
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
  loginUser = async (): Promise<UserResponse> => {
    try {
      let response: UserResponse = {
        status: false,
        data: null,
        idx: null,
        error: null,
      };

      const seed = await this.signature.sign();
      const { idx, ceramic } = await this.auth.generateIdentity(Uint8Array.from(seed));
      const { client, threadId } = await this.auth.generateThread(seed, this.apiKey, this.apiSecret, this.threadId);
      const connectionData = { client, threadId, idx };
      this.connection = connectionData;
      this.Utils = init(this.databaseType, this.connection);
      this.crypto = this.Utils.crypto;
      this.database = this.Utils.database;
      const userData: UserResponse = await this.getUser({ did: idx?.id });
      if (userData.status === false) {
        response = {
          status: false,
          data: null,
          idx: idx!,
          error: new Error("User doesn't exist"),
        };
      } else {
        response = {
          status: true,
          data: userData.data,
          idx: idx!,
          error: null,
        };
      }
      return response;
    } catch (err) {
      throw new Error(`Error, while connecting the user, ${err}`);
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
  createUser = async (name: string, email: string, signUpMode: number, userAddress: string): Promise<UserResponse> => {
    try {
      let response: UserResponse = {
        status: false,
        data: null,
        idx: null,
        error: null,
      };

      let idx: IDX | null = this.connection.idx;
      let did: string = idx?.id || '';
      const data: UserSchema = {
        did,
        name,
        email,
        safes: [],
        signUpMode,
        userAddress,
      };

      const result: UserResponse = await createUser(data, this.connection.idx?.id!);
      if (result.status === false) {
        const ceramicResult = await idx?.set(definitions.profile, {
          name: name,
          email: email,
        });
        response = {
          status: true,
          data: result.data,
          idx: null,
          error: null,
        };
      } else if (result.status === true) {
        response = {
          status: false,
          data: result.data,
          idx: null,
          error: new Error(`${email} already registered.`),
        };
      }
      return response;
    } catch (err) {
      throw new Error(`Error while registering user ${err}`);
    }
  };

  /**
   * This API is used to get the login information of the user
   * @param obj Takes email or did as parameter to get the user information
   * @returns User or null based on user information present
   */
  getUser = async (obj: { email?: string; did?: string }): Promise<UserResponse> => {
    try {
      let result: UserResponse = {
        status: false,
        data: null,
        idx: null,
        error: null,
      };
      let user: User | null = null;
      if (obj.did) {
        user = await getUser({ did: obj.did });
      } else if (obj.email) {
        user = await getUser({ email: obj.email });
      }
      if (user !== null) {
        result = {
          status: true,
          data: user,
          idx: null,
          error: null,
        };
      } else {
        result = {
          status: false,
          data: user,
          idx: null,
          error: null,
        };
      }

      return result;
    } catch (err) {
      throw new Error(`User not registered`);
    }
  };

  /**
   * This API is used to get all the user basic information on the platform
   * @returns Array of users on the platform
   */
  getUsers = async (): Promise<UserMeta[]> => {
    try {
      const users: UserMeta[] = await getUsers();
      return users;
    } catch (err) {
      throw new Error('Error while getting new users');
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
    creatorDID: string,
    beneficiaryDID: string,
    safeData: SafeStore,
    onChain: boolean,
    claimType: number,
    signalingPeriod: number,
    dDay: number
  ): Promise<SafeCreationResponse> => {
    try {
      let response: SafeCreationResponse = {
        status: false,
        safeId: null,
        error: null,
      };
      let guardians: User[] = [];
      let txReceipt: TransactionReceipt | undefined;

      //userQueryDid function
      const creatorUser: User[] = await queryUserDid(creatorDID);
      const beneficiaryUser: User[] = await queryUserDid(beneficiaryDID);
      const guardiansDid: string[] = await this.randomGuardians(creatorDID, beneficiaryDID);

      if (guardiansDid.length > 1) {
        for (let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++) {
          let guardianData: UserResponse = await this.getUser({ did: guardiansDid[guardianIndex] });
          guardians.push(guardianData.data!);
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
        };

        const safe: string[] = await createSafe(data);

        if (onChain === true) {
          const metaDataEvidenceUri: string = await createMetaData(
            '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            creatorUser[0].userAddress
          );

          const arbitrationFee: number = await this.arbitrator.getArbitrationFee();
          const guardianFee: number = 0.1;

          if (claimType === Types.ClaimType.ArbitrationBased) {
            const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + guardianFee)));
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
            const totalFee: string = String(ethers.utils.parseEther(String(guardianFee)));
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
              },
            ];
          } else {
            creatorUser[0].safes.push({
              safeId: safe[0],
              type: 'creator',
            });
          }

          if (beneficiaryUser[0].safes.length === 0) {
            beneficiaryUser[0].safes = [
              {
                safeId: safe[0],
                type: 'beneficiary',
              },
            ];
          } else {
            beneficiaryUser[0].safes.push({
              safeId: safe[0],
              type: 'beneficiary',
            });
          }

          for (let guardianIndex = 0; guardianIndex < guardiansDid.length; guardianIndex++) {
            if (guardians[guardianIndex].safes.length === 0) {
              guardians[guardianIndex].safes = [
                {
                  safeId: safe[0],
                  type: 'guardian',
                },
              ];
            } else {
              guardians[guardianIndex].safes.push({
                safeId: safe[0],
                type: 'guardian',
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
        }
        response = {
          status: true,
          safeId: safe[0],
          error: null,
        };
      } else {
        response = {
          status: false,
          safeId: null,
          error: new Error('No guardians available to create a safe'),
        };
      }

      return response;
    } catch (err) {
      throw new Error(`Error while creating a safe. ${err}`);
    }
  };

  /**
   * This API returns the data of the safe
   * @param safeId ID of the safe being queried
   * @returns Encrypted Safe Data
   */
  getSafe = async (safeId: string): Promise<SafeResponse> => {
    try {
      let response: SafeResponse = {
        status: false,
        data: null,
        error: null,
      };
      const result: Safe = await getSafeData(safeId);
      response = {
        status: true,
        data: result,
        error: null,
      };
      return response;
    } catch (err) {
      throw new Error('Error while fetching safe data');
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
  createClaim = async (safeId: string, file: any, evidenceName: string, description: string): Promise<number> => {
    try {
      let evidenceUri: string = '';
      let tx: TransactionResponse;
      let disputeId: number = 0;
      let txReceipt: any;
      let createSafetx: TransactionResponse;
      let createSafetxReceipt: any;
      let dispute: any;

      let safeData: SafeResponse = await this.getSafe(safeId);
      const safe = safeData.data!;
      let creatorUser: User[] = await queryUserDid(safe.creator);

      if (safe.onChain === true) {
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
            const guardianFee: number = 0.1;
            const totalFee: string = String(ethers.utils.parseEther(String(arbitrationFee + guardianFee)));
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
            const guardianFee: number = 0.1;
            const totalFee: string = String(ethers.utils.parseEther(String(guardianFee)));
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
          const guardianFee: number = 0.1;
          const totalFee: string = String(ethers.utils.parseEther(String(guardianFee)));
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
            dispute = txReceipt.events[2].args[2];
            disputeId = parseInt(dispute._hex);
          }
        } else if (safe.claimType === Types.ClaimType.SignalBased) {
          if (safe.stage === SafeStages.ACTIVE) {
            dispute = txReceipt.events[0].args[2];
            disputeId = parseInt(dispute._hex);
          }
        } else if (safe.claimType === Types.ClaimType.DDayBased) {
          dispute = txReceipt.events[0].args[2];
          disputeId = parseInt(dispute._hex);
        }

        safe.stage = SafeStages.CLAIMING;

        if (safe.claims.length === 0) {
          safe.claims = [
            {
              createdBy: this.connection.idx?.id,
              claimStatus: ClaimStages.ACTIVE,
              disputeId: disputeId,
            },
          ];
        } else {
          safe.claims.push({
            createdBy: this.connection.idx?.id,
            claimStatus: ClaimStages.ACTIVE,
            disputeId: disputeId,
          });
        }
        await this.database.save(safe, 'Safes');
      }
      return disputeId;
    } catch (err) {
      throw new Error(`Error while creating a claim ${err}`);
    }
  };

  /**
   * This API is called by guardians when they have to recover the safe they are part of
   * @param safeId ID of the safe being recovered
   * @param did DID of the guardian
   * @returns True of False based on the recovery process
   */
  reconstructSafe = async (safeId: string, did: string): Promise<boolean> => {
    try {
      const safeData: SafeResponse = await this.getSafe(safeId);
      const safe = safeData.data!;
      const indexValue = safe.guardians.indexOf(did);
      let recoveryCount: number = 0;
      let recoveryStatus: boolean = false;

      if (safe.stage === SafeStages.RECOVERING) {
        const decShard = await this.connection.idx?.ceramic.did?.decryptDagJWE(
          safe.encSafeKeyShards[indexValue].encShard
        );
        safe.encSafeKeyShards[indexValue].status = 1;
        safe.encSafeKeyShards[indexValue].decData = decShard;

        safe.encSafeKeyShards.map((safeShard) => {
          if (safeShard.status === 1) {
            recoveryCount = recoveryCount + 1;
          }
        });

        if (recoveryCount >= 2) {
          safe.stage = SafeStages.RECOVERED;
        } else {
          safe.stage = SafeStages.RECOVERING;
        }
        recoveryStatus = true;
        await this.database.save(safe, 'Safes');
      } else {
        recoveryStatus = false;
      }

      return recoveryStatus;
    } catch (err) {
      throw new Error(`Error while guardian Recovery, ${err}`);
    }
  };

  /**
   * This API is for creator of the safe to recover safe data
   * @param safeId ID of the safe being recovered
   * @returns Decrypted Safe Data
   */
  recoverSafeByCreator = async (safeId: string): Promise<any> => {
    try {
      let recoveredData: SafeRecovered = {
        status: false,
        data: null,
      };
      const safeData: SafeResponse = await this.getSafe(safeId);
      const encSafeData = safeData.data!.encSafeData;
      const data = await this.crypto.decryptSafeData(safeData.data!.encSafeKey, this.connection, encSafeData);
      const reconstructedData = JSON.parse(data.toString());
      recoveredData = {
        status: true,
        data: reconstructedData,
      };
      return reconstructedData;
    } catch (err) {
      throw new Error(`Error whole decrypting data, ${err}`);
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
  private updateStage = async (safeId: string, claimStage: number, safeStage: number): Promise<boolean> => {
    try {
      const result: boolean = await updateStage(safeId, claimStage, safeStage);
      return result;
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
  recoverSafeByBeneficiary = async (safeId: string, did: string): Promise<SafeRecovered> => {
    try {
      let recoveredData: SafeRecovered = {
        status: false,
        data: null,
      };
      let shards: Object[] = [];
      let reconstructedSafeData: any;
      let safeData: any;
      let result: any;
      const safeResponse: SafeResponse = await this.getSafe(safeId);
      const safe = safeResponse.data!;

      if (safe.stage === SafeStages.RECOVERED || safe.stage === SafeStages.CLAIMED) {
        safe.encSafeKeyShards.map((share) => {
          share.status === 1 ? shards.push(share.decData.share) : null;
        });

        reconstructedSafeData = await this.crypto.reconstructSafeData(shards);
        safeData = await this.crypto.decryptSafeData(
          reconstructedSafeData.beneficiaryEncKey,
          this.connection,
          Buffer.from(safe.encSafeData)
        );

        if (safeData !== undefined && safe.stage === SafeStages.RECOVERED) {
          await this.updateStage(safeId, ClaimStages.PASSED, SafeStages.CLAIMED);
          result = JSON.parse(safeData.toString());
          recoveredData = {
            status: true,
            data: result.data,
          };
        } else {
          recoveredData = {
            status: false,
            data: null,
          };
        }
      }

      return recoveredData;
    } catch (err) {
      throw new Error(`Error while recovering data for Beneficiary, ${err}`);
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
      throw new Error('Error while getting onChain data');
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
      throw new Error(`Error while getting onChain claim data ${err}`);
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
      throw new Error(`Error while getting onChain claim data ${err}`);
    }
  };

  /**
   * This API syncs onChain and offChain stages of the safe
   * @ignore
   * @param safeId ID of the safe.
   * @returns True or False based on the sync process
   */
  syncStage = async (safeId: string): Promise<boolean> => {
    try {
      let disputeId: number = 0;
      let claimIndex: number = 0;
      const safeData: SafeResponse = await this.getSafe(safeId);
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
      return true;
    } catch (err) {
      throw new Error(`Error while syncing stage data, ${err}`);
    }
  };

  /**
   * @ignore
   * Disclaimer: Internal API only. Not production API
   * Use at your loss
   * If you reading this code and come across this, be warned not to use this at all
   *  */
  giveRuling = async (disputeId: number, ruling: number): Promise<boolean> => {
    try {
      const result: boolean = await this.arbitrator.giveRulingCall(disputeId, ruling);
      return result;
    } catch (err) {
      throw new Error('Error while giving a ruling for dispute');
    }
  };

  /**
   * The API is used to send signal to the safe onChain
   * @param safeId ID of the safe
   * @returns Transaction details of the signal
   */
  createSignal = async (safeId: string): Promise<TransactionReceipt> => {
    try {
      const tx: TransactionResponse = await this.contract.sendSignal(safeId);
      const txReceipt: TransactionReceipt = await tx.wait();
      if (txReceipt.status === 1) {
        await this.updateStage(safeId, ClaimStages.ACTIVE, SafeStages.ACTIVE);
      }
      return txReceipt;
    } catch (err) {
      throw new Error(`Error while sending a signal, ${err}`);
    }
  };

  /**
   * This API is used by guardians to claim the incentivisation
   * @param safeId ID of the safe
   * @returns True or false based on the incentivisation process
   */
  incentiviseGuardians = async (safeId: string): Promise<boolean> => {
    try {
      let shards: any = [];
      let guardianArray: any = [];
      let guardianSecret: string[] = [];
      let result: boolean = false;

      const safeData: SafeResponse = await this.getSafe(safeId);
      const safe = safeData.data!;

      if (safe.stage === SafeStages.CLAIMED) {
        safe.encSafeKeyShards.map((share) => {
          if (share.status === 1) {
            shards.push(share.decData.share);
            guardianSecret.push(share.decData.secret);
          }
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

          result = await this.contract.guardianProof(
            JSON.stringify(message),
            reconstructedData.signature,
            guardianArray,
            guardianSecret,
            safeId
          );
        }
      }
      return result;
    } catch (e) {
      throw new Error(`Error while incentiving the guardians ${e}`);
    }
  };

  /**
   * This function returns the total guardian reward balance of a guardian
   * @param address The address of the guardian
   * @returns The total guardian reward balance in ETH
   */
  getRewardBalance = async (address: string): Promise<Number> => {
    try {
      const result: Number = await this.contract.getGuardianRewards(address);
      return result;
    } catch (e) {
      throw new Error(`Error while get the guardian's rewards balance ${e}`);
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
      throw new Error(`Error while claiming rewards for the guardians ${e}`);
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
      throw new Error(`Error while updating the D-Day ${e}`);
    }
  };
}
