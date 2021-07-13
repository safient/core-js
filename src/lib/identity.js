import Ceramic from '@ceramicnetwork/http-client'
import {IDX} from '@ceramicstudio/idx'
import {Ed25519Provider} from 'key-did-provider-ed25519'
import {definitions} from "../utils/config.json"
import { BigNumber, utils, ethers } from 'ethers'
import { hashSync } from 'bcryptjs'
import KeyDidResolver from 'key-did-resolver'
import { DID } from 'dids'

const CERAMIC_URL = 'http://0.0.0.0:7007'


export const generateIDX = async (seed) => {
    // avoid sending the raw secret by hashing it first
    try{
      if(seed){
        const ceramic = new Ceramic(CERAMIC_URL)
        const resolver = { ...KeyDidResolver.getResolver()}
        const did = new DID({ resolver })
        ceramic.setDID(did)
        await ceramic.did.setProvider(new Ed25519Provider(seed))
        await ceramic.did.authenticate()
        // Create the IDX instance with the definitions aliases from the config
        const idx = new IDX({ ceramic, aliases: definitions })
        return {idx, ceramic}
      }else{
        return {idx: null, ceramic: null}
      }
    }catch(error){
        console.log(error)
        return {idx: null, ceramic: null}
    }

  }
