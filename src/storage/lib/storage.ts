import e from "cors";
import {ipfsPublish} from "../utils/ipfs"


export class Storage {

    public storageType: string;

    constructor(storage: string){
        this.storageType = storage
    }


    add = async(fileName: string, data:any): Promise<any> => {
        try{
            if(this.storageType === 'IPFS'){
                const result: any = await ipfsPublish(fileName, data);
                return result;
            }
        }catch(err){
            throw new Error("Error while publishing data")
        } 
    }


}