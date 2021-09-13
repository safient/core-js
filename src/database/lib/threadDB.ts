const { Where } = require('@textile/hub');

import { Connection, RegisterStatus, SafeCreation, SafeData, User, UserBasic, Users, UserSchema } from "../../types/types";



export class ThreadDB {

    private connection: Connection

    constructor (connectionObject: Connection) {
        this.connection = connectionObject;
    }


    checkUser = async(email: string): Promise<RegisterStatus> =>{

        try{
            let registerStatus: RegisterStatus
            const emailQuery = new Where('email').eq(email);
            const result: User[] = await this.connection.client.find(this.connection.threadId, 'Users', emailQuery);
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
            throw new Error("Error while checking user status")
        }
        
    }

    //1st register user

    registerNewUser = async(userData: UserSchema): Promise<String> => {

        try {

          let result: String = ''
          const userStatus: RegisterStatus = await this.checkUser(userData.email);

          if (userStatus.status === true) {

            result = '';

          }else if(userStatus.status === false){

            const userRegistration: String[] = await this.connection.client.create(this.connection.threadId, 'Users', [userData]);
            result = userRegistration[0]

          }

          return result;

        } catch (err) {
            throw new Error(`Error while registering user, ${err}`);
        }
      };


      getLoginUser = async (did:string): Promise<User | any> => {

        try {
          const query = new Where('did').eq(did);
          const result: User[] = await this.connection.client.find(this.connection.threadId, 'Users', query);
    
          if (result.length < 1) {
            return null
          } else {
            return result[0];
          }

        } catch (err) {
          throw new Error(`${did} not registered`);
        }
      };

      getUsers = async (): Promise<Users> => {

        try {
          const registeredUsers: User[] = await this.connection.client.find(this.connection.threadId, 'Users', {});
          let caller: UserBasic | string = this.connection.idx?.id || '';
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

      queryUserEmail = async (email:string): Promise<UserBasic | Boolean> => {
        try {
          const query = new Where('email').eq(email);
          const result: User[] = await this.connection.client.find(this.connection.threadId, 'Users', query);

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

      queryUserDid = async (did:string): Promise<User[]> => {
        try {
          const query = new Where('did').eq(did);
          const result: User[] = await this.connection.client.find(this.connection.threadId, 'Users', query);

          if (result.length < 1) {
            return []
          } else {
            return result;
          }
        } catch (err) {
          throw new Error("Error while querying user");
        }

      };


      generateRandomGuardians = async (creatorDID: string | any, beneficiaryDID: string | any): Promise<string[]> => {

        try{

          const users: User[] = await this.connection.client.find(this.connection.threadId, 'Users', {});
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
    
      createSafe = async(safeData: SafeCreation): Promise<string[]> => {
          try{
            const safe: string[] = await this.connection.client.create(this.connection.threadId, 'Safes', [safeData]);
            return safe
          }catch(err){
              throw new Error("Error while creating safe")
          }
        
      }

      saveData = async(data: any, collection: string): Promise<boolean> => {
        try{
            await this.connection.client.save(this.connection.threadId, collection,[data])
            return true
        }catch(err){
            throw new Error("Error while saving data")
        }
      }

      deleteData = async(data: any, collection: string): Promise<boolean> => {
        try{
            await this.connection.client.delete(this.connection.threadId, collection, [data] );
            return true
        }catch(err){
            throw new Error("Error while deleting data")
        }
      }

      getSafeData = async (safeId: string): Promise<SafeData> => {
        try {
          const query = new Where('_id').eq(safeId);
          const result: SafeData[] = await this.connection.client.find(this.connection.threadId, 'Safes', query);
          return result[0];
        } catch (err) {
          throw new Error("Error while fetching safe data");
        }
      };

      updateStage = async(safeId: string, claimStage: number, safeStage: number): Promise<boolean> => {
        try{
          
          const safe: SafeData = await this.getSafeData(safeId);
          safe.stage = safeStage;
          safe.claims[0].claimStatus = claimStage;
        
          const saveStatus: boolean = await this.saveData(safe, 'Safes');
        //   await this.connection.client.save(this.connection.threadId, 'Safes', [result[0]]);
        if(saveStatus === true){
               return saveStatus; 
        }else{
            return false;
        }
          
        }catch(err){
          throw new Error(`Error while updating a stage ${err}`)
        }
      }

    }


     