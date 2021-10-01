import { CeramicIdx } from "../../types/types";
import {generateIDX} from "../utils/ceramic"

export class Auth {

    generateIdx = async(seed: any) => {
        try{
            const result = await generateIDX(seed);
            console.log(result)
            return result
        }catch(err){
            throw new Error(`${err}`)
        }

    }
}