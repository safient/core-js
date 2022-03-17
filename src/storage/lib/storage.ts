import e from "cors";
import {ipfsAdd, ipfsGet, ipfsPublish} from "../utils/ipfs"


export class Storage {

    public storageType: string;

    constructor(storage: string){
        this.storageType = storage
    }


    add = async(data:any, fileName: string, ): Promise<any> => {
        try{
            if(this.storageType === 'IPFS'){
                const result: any = await ipfsPublish(fileName, data);
                return result;
            }
        }catch(err){
            throw new Error("Error while publishing data")
        } 
    }

    create = async(data:any): Promise<any> => {
        try{
            if(this.storageType === 'IPFS'){
                const result: any = await ipfsAdd(data);
                return result;
            }
        }catch(err){
            throw new Error(`Error while publishing data, ${err}`)
        } 
    }

    get = async(cidHash:string): Promise<any> => {
        try{
            if(this.storageType === 'IPFS'){
                const result: any = await ipfsGet(cidHash);
                return result;
            }
        }catch(err){
            throw new Error("Error while publishing data")
        } 
    }
}