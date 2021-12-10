const { Where } = require('@textile/hub');

import { Connection, Safe, User} from "../../lib/types";



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
  
    threadRead = async<T extends User | Safe>(queryVariable: string, queryValue: string, collection: string): Promise<T[]> => {
      try{
        let result: T[] = []
        if(collection === 'Users' && queryValue !== ''){
          const query = new Where(queryVariable).eq(queryValue);
          result = await this.connection.client.find<T>(this.connection.threadId, collection, query);
        }else if(collection === 'Users' && queryValue === '' && queryVariable === ''){
          result = await this.connection.client.find(this.connection.threadId, collection, {});
        }else{
          const query = new Where('_id').eq(queryValue);
          result = await this.connection.client.find(this.connection.threadId, collection, query);
        }
       
        return result
      }catch(err){
          throw new Error("Error while reading user data")
      }
    }
}


     