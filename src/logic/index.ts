import { Crypto } from "../crypto"
import {Database} from "../database/index"
import { Connection, Utils } from "../types/types"


let database: Database
let crypto: Crypto;

export const init = (databaseType: string, connection: Connection): Utils => {
    database = new Database(databaseType, connection);
    crypto = new Crypto();
    return {database, crypto}
}

