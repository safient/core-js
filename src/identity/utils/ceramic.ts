import Ceramic from "@ceramicnetwork/http-client";
import {IDX} from '@ceramicstudio/idx'
import {Ed25519Provider} from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import { DID } from 'dids'
import { CeramicDefintions } from "../../lib/types";


    export const generateIDX = async(seed: any, ceramicURL: string, ceramicDefintions: CeramicDefintions) => {
        try{
            if(seed){
                const provider = new Ed25519Provider(seed)
                console.log(provider)
                console.log(KeyResolver.getResolver())
                const resolver = {...KeyResolver.getResolver()};
                const did = new DID({ provider, resolver })
                await did.authenticate()

                const ceramic: Ceramic = new Ceramic(ceramicURL);
                
                ceramic.setDID(did);
                await ceramic.did?.setProvider(provider);
                await ceramic.did?.authenticate()
                const idx: IDX = new IDX({ceramic, aliases: ceramicDefintions.definitions})
                return {idx:idx, ceramic: ceramic}
            }else{
                return {idx:null, ceramic: null}
            }
        }catch(err){
            throw new Error("Error while creating IDX")
        }
    }
