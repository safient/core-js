import { Crypto } from "../crypto"
import {Database} from "../database/index"

import { Connection, RegisterStatus, SafeCreation, SafeData, User, UserBasic, Users, UserSchema, Utils } from "../types/types";


let database: Database
let crypto: Crypto;
let connection: Connection

/**
 * 
 * @param databaseType - Type of database to be used
 * @param connectionObject - Connection object of the database selected
 * @returns 
 */
export const init = (databaseType: string, connectionObject: Connection): Utils => {
    database = new Database(databaseType, connectionObject);
    crypto = new Crypto();
    connection = connectionObject;
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

export const registerNewUser = async(userData: UserSchema): Promise<string> => {

    try {

      let result: string = ''
      const userStatus: RegisterStatus = await checkUser(userData.email);

      if (userStatus.status === true) {

        result = '';

      }else if(userStatus.status === false){

        const userRegistration: string[] = await database.create(userData, 'Users')
        result = userRegistration[0]

      }

      return result;

    } catch (err) {
        throw new Error(`Error while registering user, ${err}`);
    }
  };

  /**
   * 
   * @param did - Did of the user
   * @returns - User data if it exists
   */
  export const getLoginUser = async (did:string): Promise<User | any> => {

    try {
       const result: User[] = await database.read<User>('did', did, 'Users')
      if (result.length < 1) {
        return null
      } else {
        return result[0];
      }

    } catch (err) {
      throw new Error(`${did} not registered`);
    }
  };

  /**
   * 
   * @returns - All the users on the database
   */
  export const getUsers = async (): Promise<Users> => {

    try {
        
      const registeredUsers: User[] =  await database.read<User>('', '', 'Users')
      
      let caller: UserBasic | string = connection.idx?.id || '';
      let userArray: UserBasic[] = [];

      for (let i = 0; i < registeredUsers.length; i++) 
      {
        const result = registeredUsers[i];
        const value: UserBasic = {
          name: result.name,
          email: result.email,
          did: result.did,
        };

        value.did.toLowerCase() === result.did.toLowerCase() ? (caller = value) : (caller = `${value.did} is not registered!`);
        userArray.push(value);
      }
      
      const result: Users = {
          userArray: userArray,
          caller: caller
      }

      return result;

    } catch (err) {
      throw new Error("Error while getting new users");
    }
  };

  /**
   * 
   * @param email - Email of the user to be queried
   * @returns - Users basic information
   */
  export const queryUserEmail = async (email:string): Promise<UserBasic | Boolean> => {
    try {

      const result: User[] = await database.read<User>('email', email, 'Users')
      if (result.length < 1) {
        return false
      } else {
        const data: UserBasic = {
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
  export const getSafeData = async (safeId: string): Promise<SafeData> => {
    try {
      const result: SafeData[] = await database.read<SafeData>('', safeId, 'Safes')
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
      
      const safe: SafeData = await getSafeData(safeId);
      safe.stage = safeStage;
      safe.claims[0].claimStatus = claimStage;
      await database.save(safe, 'Safes')
      return true
      
    }catch(err){
      throw new Error(`Error while updating a stage ${err}`)
    }
  }

