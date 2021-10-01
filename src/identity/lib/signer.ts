import { Signer } from "../../types/types"
import {generateSignature} from "../utils/signerUtils"

export class Signature {

    private signer: Signer
    constructor(signerObject: Signer){
        this.signer = signerObject
    } 

    sign = async(): Promise<any> => {
        try{
            const result = await generateSignature(this.signer)
            console.log("line 14, signer.ts inside lib", typeof result)
            return result
        }catch(err){
            throw new Error(`${err}`)
        }
    }
}