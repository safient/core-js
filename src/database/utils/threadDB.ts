const { Where } = require('@textile/hub');

import { Connection, SafeData, User} from "../../types/types";



export class ThreadDB {

    private connection: Connection

    constructor (connectionObject: Connection) {
        this.connection = connectionObject;
    }

    threadCreate = async(data: any, collection: string): Promise<string[]> => {
      try{
              const result: string[] = await this.connection.client.create(this.connection.threadId, collection, [data]);
              return result
      }catch(err){
          throw new Error(`Error while creating data, ${err}`)
      }
    }

    threadSave = async(data: any, collection: string): Promise<boolean> => {
      try{
              await this.connection.client.save(this.connection.threadId, collection,[data])
              return true
      }catch(err){
          throw new Error("Error while saving data")
      }
    }

    threadDelete = async(data: any, collection: string): Promise<boolean> => {
      try{
              await this.connection.client.delete(this.connection.threadId, collection, [data] );
              return true
  
      }catch(err){
          throw new Error("Error while deleting data")
      }
    }
  
    threadReadUser = async(queryVariable: string, queryValue: string): Promise<User[]> => {
      try{
        const emailQuery = new Where(queryVariable).eq(queryValue);
        const result: User[] = await this.connection.client.find(this.connection.threadId, 'Users', emailQuery);
        return result
      }catch(err){
          throw new Error("Error while reading user data")
      }
    }

    threadReadAllUsers = async(): Promise<User[]> => {
      try{
        const result: User[] = await this.connection.client.find(this.connection.threadId, 'Users', {});
        return result
      }catch(err){
          throw new Error("Error while reading user data")
      }
    }

    threadReadSafe = async(safeId: string): Promise<SafeData[]> => {
      try{
        const query = new Where('_id').eq(safeId);
        const result: SafeData[] = await this.connection.client.find(this.connection.threadId, 'Safes', query);
        return result
      }catch(err){
          throw new Error("Error while reading safe data")
      }
    }
}


     