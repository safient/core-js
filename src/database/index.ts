import { Connection } from '../types/types';
import { ThreadDB } from './lib/threadDB';
export class Database {
    
  public db : ThreadDB

  constructor(dbName: string, connection: Connection) {
    if(dbName === 'threadDB'){
        this.db= new ThreadDB(connection);
    }else {
        this.db = new ThreadDB(connection);
    }
  }

}
