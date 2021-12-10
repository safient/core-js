import { Connection, Safe, User } from '../../lib/types';
import { DatabaseType } from '../../lib/enums';
import { ThreadDB } from '../utils/threadDB';

export class Database {
    
  public db : ThreadDB
  private connection: Connection
  private dbName: DatabaseType
  
  /**
   * 
   * @param dbName - Database which should be used
   * @param connection - Connection Object of the chosen database
   */
  constructor(dbName: DatabaseType, connection: Connection) {
      this.dbName = dbName;
      this.connection = connection;

    if(dbName === DatabaseType.threadDB){
        this.db= new ThreadDB(connection);
    }else {
        this.db = new ThreadDB(connection);
    }
  }

  /**
   * 
   * @param data - Data that needs to be created
   * @param collection - Collection on which data has to be saved
   * @returns 
   */
  create = async(data: any, collection: string): Promise<string[]> => {
    try{
        let result: string[] = []
        if(this.dbName === DatabaseType.threadDB){
            result = await this.db.threadCreate(data, collection)
        }
        return result

    }catch(err){
        throw new Error(`Error while creating data, ${err}`)
    }
  }

  save = async(data: any, collection: string): Promise<boolean> => {
    try{
        if(this.dbName === DatabaseType.threadDB){
            await this.db.threadSave(data, collection)
        }
        return true

    }catch(err){
        throw new Error("Error while saving data")
    }
  }

  delete = async(data: any, collection: string): Promise<boolean> => {
    try{
        if(this.dbName === DatabaseType.threadDB){
            await this.db.threadDelete(data, collection);
        }
        return true

    }catch(err){
        throw new Error("Error while deleting data")
    }
  }

  read = async<T extends User | Safe>(queryVariable: string, queryValue: string, collection: string): Promise<T[]> => {
    try{
        let result: T[]=[] 
        if(this.dbName === DatabaseType.threadDB){
            result = await this.db.threadRead<T>(queryVariable, queryValue, collection)
        }

        return result

    }catch(err){
        throw new Error("Error while reading user data")
    }
  }
}





















