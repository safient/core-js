import { Connection } from '../../types/types';
import { ThreadDB } from '../utils/threadDB';

export class Database {
    
  public db : ThreadDB
  private connection: Connection
  private dbName: string

  constructor(dbName: string, connection: Connection) {
      this.dbName = dbName;
      this.connection = connection;

    if(dbName === 'threadDB'){
        this.db= new ThreadDB(connection);
    }else {
        this.db = new ThreadDB(connection);
    }
  }

  save = async(data: any, collection: string): Promise<boolean> => {
    try{
        if(this.dbName === 'threadDB'){
            await this.connection.client.save(this.connection.threadId, collection,[data])
            return true
        }else{
            //mongoDB or other
            await this.connection.client.save(this.connection.threadId, collection,[data])
            return true
        }
        
    }catch(err){
        throw new Error("Error while saving data")
    }
  }

  delete = async(data: any, collection: string): Promise<boolean> => {
    try{
        if(this.dbName === 'threadDB'){
            await this.connection.client.delete(this.connection.threadId, collection, [data] );
            return true
        }else{
            await this.connection.client.delete(this.connection.threadId, collection, [data] );
            return true
        }

    }catch(err){
        throw new Error("Error while deleting data")
    }
  }


}





















