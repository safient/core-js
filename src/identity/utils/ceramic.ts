import Ceramic from "@ceramicnetwork/http-client";
import {IDX} from '@ceramicstudio/idx'
import {Ed25519Provider} from 'key-did-provider-ed25519'
import KeyDidResolver from 'key-did-resolver'
import { DID } from 'dids'
import { CeramicDefintions } from "../../lib/types";


const CERAMIC_URL: string = 'https://ceramic-clay.safient.io/'

    export const generateIDX = async(seed: any, ceramicURL: string, ceramicDefintions: CeramicDefintions) => {
        try{
            if(seed){
                const ceramic: Ceramic = new Ceramic(ceramicURL);
                const resolver = {...KeyDidResolver.getResolver()};
                const did: DID = new DID({resolver})
                ceramic.setDID(did);
                await ceramic.did?.setProvider(new Ed25519Provider(seed));
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
