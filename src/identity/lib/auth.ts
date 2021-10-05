import { CeramicIdx } from "../../types/types";
import {generateIDX} from "../utils/ceramic"
import { thread } from "../utils/threadId";

export class Auth {

    generateIdentity = async(seed: any) => {
        try{
            const result = await generateIDX(seed);
            return result
        }catch(err){
            throw new Error(`${err}`)
        }
    }

    generateThread = async(seed: any, apiKey: string, secret:string) => {
        try{
            const result = await thread(seed, apiKey, secret);
            return result
        }catch(err){
            throw new Error(`${err}`)
        }
    }
}