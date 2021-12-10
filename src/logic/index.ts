import { Crypto } from "../crypto"
import {Database} from "../database"
import {Storage} from "../storage/index"
import {DatabaseType} from "../lib/enums"
 
import { Connection, Evidence, RegisterStatus, SafeCreation, Safe, User, UserMeta, UserResponse, UserSchema, Utils } from "../lib/types";

var environment = require("browser-or-node");


let database: Database
let crypto: Crypto;
let connection: Connection
let storage: Storage
let safientAgreementURI: string = '/ipfs/QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13/Safex Agreement.png';


/**
 * 
 * @param databaseType - Type of database to be used
 * @param connectionObject - Connection object of the database selected
 * @returns 
 */
export const init = (databaseType: DatabaseType, connectionObject: Connection): Utils => {
    database = new Database(databaseType, connectionObject);
    crypto = new Crypto();
    connection = connectionObject;
    storage = new Storage('IPFS')
    return {database, crypto}
}

/**
 * 
 * @param email - Email of the user
 * @returns - The status of the user if he exists or not
 */
export const checkUser = async(email: string): Promise<RegisterStatus> =>{

    try{
        let registerStatus: RegisterStatus
        const result: User[] = await database.read<User>('email', email, 'Users')

        if(result.length === 1){
            registerStatus = {
                status: true,
                user: result[0]
            }
        }
        else {
        registerStatus = {
                status: false,
                user: result[0]
            } 
        }
        return registerStatus

    }catch(err){
        throw new Error(`Error while checking user status, ${err}`)
    }
    
}

/**
 * 
 * @param userData - The user data that is created on the database
 * @returns - Database ID of the created data
 */

export const createUser = async(userData: UserSchema, did: string): Promise<UserResponse> => {

    try {

      let response: UserResponse = {
        status: false,
        data: null,
        idx: null,
        error: null
      }
      const userStatus: RegisterStatus = await checkUser(userData.email);

      if (userStatus.status === true) {

        const userData: User | null = await getUser({did: did});

        response = {
          status: true,
          data: userData!,
          idx: null,
          error: new Error("User already exists")
        }

      }else if(userStatus.status === false){

        const userRegistration: string[] = await database.create(userData, 'Users')
        const user: User | null = await getUser({did: did});
        response = {
          status: false,
          data: user!,
          idx: null, 
          error: null
        }

      }

      return response;

    } catch (err) {
        throw new Error(`Error while registering user, ${err}`);
    }
  };

  /**
   * 
   * @param did - Did of the user
   * @returns - User data if it exists
   */
  export const getUser = async (Obj : {email?: string, did?:string}): Promise<User | null> => {

    try {

      let result: User[] = []
      if(Obj.did){
        result = await database.read<User>('did', Obj.did!, 'Users')
      }else{ if(Obj.email)
        result = await database.read<User>('email', Obj.email!, 'Users')
      }
      if (result.length < 1) {
        return null
      } else {
        return result[0];
      }

    } catch (err) {
      throw new Error(`User not registered`);
    }
  };

  /**
   * 
   * @returns - All the users on the database
   */
  export const getUsers = async (): Promise<UserMeta[]> => {

    try {
        
      const registeredUsers: User[] =  await database.read<User>('', '', 'Users')
      
      let caller: UserMeta | string = connection.idx?.id || '';
      let userArray: UserMeta[] = [];

      for (let i = 0; i < registeredUsers.length; i++) 
      {
        const result = registeredUsers[i];
        const value: UserMeta = {
          name: result.name,
          email: result.email,
          did: result.did,
        };

        value.did.toLowerCase() === result.did.toLowerCase() ? (caller = value) : (caller = `${value.did} is not registered!`);
        userArray.push(value);
      }

      return userArray;

    } catch (err) {
      throw new Error("Error while getting new users");
    }
  };

  /**
   * 
   * @param email - Email of the user to be queried
   * @returns - Users basic information
   */
  export const queryUserEmail = async (email:string): Promise<UserMeta | Boolean> => {
    try {

      const result: User[] = await database.read<User>('email', email, 'Users')
      if (result.length < 1) {
        return false
      } else {
        const data: UserMeta = {
            name: result[0].name,
            email: result[0].email,
            did: result[0].did,
        }
        return data;
      }
    } catch (err) {
      throw new Error("Error while querying user");
    }

  };

  /**
   * 
   * @param did - DID of the user being queried
   * @returns - User data for that did
   */
  export const queryUserDid = async (did:string): Promise<User[]> => {
    try {
      
        const result: User[] = await database.read<User>('did', did, 'Users')

      if (result.length < 1) {
        return []
      } else {
        return result;
      }
    } catch (err) {
      throw new Error("Error while querying user");
    }

  };

  /**
   * 
   * @param creatorDID - Did of the safe creator
   * @param beneficiaryDID - Did of the beneficiary
   * @returns - Array of guardians did
   */
  export const generateRandomGuardians = async (creatorDID: string | any, beneficiaryDID: string | any): Promise<string[]> => {

    try{

      const users: User[] = await database.read<User>('', '', 'Users')
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

  /**
   * 
   * @param safeData - Safe data
   * @returns - Database Id of the safe data
   */
  export const createSafe = async(safeData: SafeCreation): Promise<string[]> => {
      try{
        const safe: string[] =  await database.create(safeData, 'Safes')
        return safe
      }catch(err){
          throw new Error("Error while creating safe")
      }
    
  }

  /**
   * 
   * @param safeId - Safe id
   * @returns - Safe data
   */
  export const getSafeData = async (safeId: string): Promise<Safe> => {
    try {
      const result: Safe[] = await database.read<Safe>('', safeId, 'Safes')
      return result[0];
    } catch (err) {
      throw new Error("Error while fetching safe data");
    }
  };

  /**
   * 
   * @param safeId - Safe id of the safe being updated
   * @param claimStage - Claim stage being updated
   * @param safeStage - Safe stage being updated
   * @returns - Boolean value
   */
  export const updateStage = async(safeId: string, claimStage: number, safeStage: number): Promise<boolean> => {
    try{
      
      const safe: Safe = await getSafeData(safeId);
      safe.stage = safeStage;
      safe.claims[0].claimStatus = claimStage;
      await database.save(safe, 'Safes')
      return true
      
    }catch(err){
      throw new Error(`Error while updating a stage ${err}`)
    }
  }

  export const createMetaData = async (safientContractAddress: string, address: string): Promise<string> => {
    try{
      const metaevidenceObj = {
          fileURI: safientAgreementURI,
          fileHash: 'QmPMdGmenYuh9kzhU6WkEvRsWpr1B8T7nVWA52u6yoJu13',
          fileTypeExtension: 'png',
          category: 'Safex Claims',
          title: 'Provide a convenient and safe way to propose and claim the inheritance and safekeeping mechanism',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          aliases: {
            [safientContractAddress]: 'SafexMain',
            [address]: [address],
          },
          question: 'Does the claimer qualify for inheritence?',
          rulingOptions: {
            type: 'single-select',
            titles: ['Yes', 'No'],
            descriptions: ['The claimer is qualified for inheritence', 'The claimer is not qualified for inheritence'],
          },
        };
        const cid: any = await storage.add('metaEvidence.json', JSON.stringify(metaevidenceObj));
        const metaevidenceURI: string = `/ipfs/${cid[1].hash}${cid[0].path}`;
        return metaevidenceURI
  }catch(err){
      throw new Error(`Error while creating metadata, ${err}`)
  }
  }

  export const createClaimEvidenceUri = async(file: any, evidenceName: string, description: string ): Promise<any> => {
    try{
        let evidenceURI: string = ''
        let buffer: Buffer | undefined
        let evidenceObj: Evidence
        let cid: any

        if(file && file.name.split('.')[1] ){
        const fileName: string = file.name;
        const fileExtension: string = file.name.split('.')[1]
        if(environment.isBrowser){
            const reader: any = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = () => {
                buffer = Buffer.from(reader.result);
            };
            const fileCid = await storage.add(fileName, buffer);
            const fileURI = `/ipfs/${fileCid[1].hash}${fileCid[0].path}`;
            evidenceObj = {
              fileURI,
              fileHash: fileCid[1].hash,
              fileTypeExtension: fileExtension,
              name: evidenceName,
              description: description,
            };
         cid = await storage.add('evidence.json', JSON.stringify(evidenceObj));
         evidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;

        }
        if(environment.isNode){
            evidenceObj = {
                fileURI: `https://ipfs.kleros.io/ipfs/QmXK5Arf1jWtox5gwVLX2jvoiJvdwiVsqAA2rTu7MUGBDF/signature.jpg`,
                fileHash:'QmXK5Arf1jWtox5gwVLX2jvoiJvdwiVsqAA2rTu7MUGBDF',
                fileTypeExtension: fileExtension,
                name: evidenceName,
                description: description,
              };
              //evidenceURI = `ipfs/QmXK5Arf1jWtox5gwVLX2jvoiJvdwiVsqAA2rTu7MUGBDF/signature.jpg`
              cid = await storage.add('evidence.json', JSON.stringify(evidenceObj));
              evidenceURI = `/ipfs/${cid[1].hash}${cid[0].path}`;
        }
        }
        else{
            evidenceURI = "NULL"
        }

        return evidenceURI 

    }catch(e){
        throw new Error(`Error while creating evidence, ${e}`)
    }

  }

  

