import React, {useState, useEffect} from 'react'
import { randomBytes } from 'crypto'
import {
    Text,
    Button,
    Loading,
    Modal,
    Input,
    Table,
    useToasts,
    Snippet
  } from '@geist-ui/react';
import {generateIDX} from '../lib/identity'
import {definitions} from '../utils/config.json'
import { loginUserWithChallenge } from '../utils/threadDb';
import { decryptShards, getLoginUser, getSafeData } from '../lib/safexDb';
import {getMailboxID, PrivateKey} from "@textile/hub";
import {
    registerNewUser,
    checkEmailExists,
  } from '../lib/safexDb';
  import { generateCipherKey } from '../utils/aes';

const CERAMIC_URL = 'https://ceramic.signchain.xyz'


const Guardians = () => {

    const [ceramic, setCeramic] = useState(null)
    const [loading, setLoading] = useState(false)
    const [guardiansData, setGuardiansData] = useState({
        gDataOne: {
            seed: [244, 135, 34, 210, 90, 21, 222, 37, 129, 152, 176, 208, 107, 94, 199, 33, 51, 9, 100, 194, 163, 214, 209, 165, 130, 219, 179, 22, 117, 202, 196, 160],
            name: "GuardianOne",
            email: "guardianOne@gmail.com"
        },
        gDataTwo: {
            seed: [66, 205, 121, 49, 108, 37, 18, 44, 240, 90, 38, 107, 76, 144, 121, 181, 239, 124, 108, 212, 83, 136, 27, 76, 235, 114, 241, 54, 116, 228, 17, 172],
            name: "GuardianTwo",
            email: "guardianTwo@gmail.com"
        },
        gDataThree: {
            seed:[210, 21, 232, 87, 226, 5, 140, 122, 137, 28, 49, 211, 42, 21, 118, 225, 24, 185, 234, 130, 42, 43, 151, 98, 196, 236, 254, 236, 19, 232, 127, 189],
            name: "GuardianThree",
            email: "guardianThree@gmail.com"
        }
    })
    const [guardianOne, setGuardianOne] = useState(null)
    const [guardianTwo, setGuardianTwo] = useState(null)
    const [guardianThree, setGuardianThree] = useState(null)

    const [guardianOneSafe, setGuardianOneSafe] = useState([])
    const [guardianTwoSafe, setGuardianTwoSafe] = useState([])
    const [guardianThreeSafe, setGuardianThreeSafe] = useState([])

    useEffect(() => {
        async function init(){
            setLoading(true)

            const gOne = await fetchGuardians(guardiansData.gDataOne)
            const gTwo = await fetchGuardians(guardiansData.gDataTwo)
            const gThree = await fetchGuardians(guardiansData.gDataThree)

            setGuardianOne(gOne)
            setGuardianTwo(gTwo)
            setGuardianThree(gThree)

            setGuardianOneSafe(gOne.threadData.safes)
            setGuardianTwoSafe(gTwo.threadData.safes)
            setGuardianThreeSafe(gThree.threadData.safes)
            
            setLoading(false)
        }
        init()
    }, [guardiansData])


    const registerUser = async (data) => {
        try{
            //step 2: generate ceramic identities
            const {idx, ceramic} = await generateIDX(data.seed);
            //step 3: use the same seeds to generate threadIdentities
            const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(data.seed))
            const client = await loginUserWithChallenge(identity);
            const ceramicRes = await idx.set(definitions.profile, {
                name: data.name,
                email: data.email,
              });
            const threadRes = await registerNewUser(idx.id, data.name, data.email, 0)
            return idx
          }catch(err){
              console.log(err)
          }
    }

    const registerGuardians = async () => {
        
        const gOne = await registerUser(guardiansData.gDataOne)
        const gTwo = await registerUser(guardiansData.gDataTwo)
        const gThree = await registerUser(guardiansData.gDataThree)
        const newGuardianData = {
            gDataOne: {
                seed: [244, 135, 34, 210, 90, 21, 222, 37, 129, 152, 176, 208, 107, 94, 199, 33, 51, 9, 100, 194, 163, 214, 209, 165, 130, 219, 179, 22, 117, 202, 196, 160],
                name: "GuardianOne",
                email: "guardianOne@gmail.com",
                idx: gOne
            },
            gDataTwo: {
                seed: [66, 205, 121, 49, 108, 37, 18, 44, 240, 90, 38, 107, 76, 144, 121, 181, 239, 124, 108, 212, 83, 136, 27, 76, 235, 114, 241, 54, 116, 228, 17, 172],
                name: "GuardianTwo",
                email: "guardianTwo@gmail.com",
                idx:gTwo
            },
            gDataThree: {
                seed:[210, 21, 232, 87, 226, 5, 140, 122, 137, 28, 49, 211, 42, 21, 118, 225, 24, 185, 234, 130, 42, 43, 151, 98, 196, 236, 254, 236, 19, 232, 127, 189],
                name: "GuardianThree",
                email: "guardianThree@gmail.com",
                idx:gThree
            }
        }
        setGuardiansData(newGuardianData)
    }
  
    const fetchGuardians = async (data) => {
            const {idx, ceramic} = await generateIDX(data.seed);
            //step 3: use the same seeds to generate threadIdentities
            const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(data.seed))
            const client = await loginUserWithChallenge(identity);
            const threadData = await getLoginUser(idx.id)
            console.log(threadData)
            if(threadData !== null){
                return {idx, threadData}
            }else {
                return null
            }
    }
    
  
    const handleDecrypt = async (safeId) => {
       const res = await decryptShards(guardianOne.idx,safeId, 0);
       const resTwo = await decryptShards(guardianTwo.idx, safeId, 1);
       const resThree = await decryptShards(guardianThree.idx,safeId, 2);
        console.log(res)
    }
    return(

        <>
        <h1>Guardians</h1>
        <Button
                type='secondary'
                ghost
                onClick={registerGuardians}
              >
                Register Guardians
        </Button>
        {
            guardianOneSafe.length !==0 ? 
             (
                 guardianOneSafe.map((safe, index) => {
                    return(
                        <>
                        <Snippet text={safe.safeId}  width="300px" /> 
                        <Button auto type='success' size='mini' onClick={()=>{handleDecrypt(safe.safeId)}} >
                            Decrypt
                        </Button>
                        </>
                    )
                 }) 
            ): 
             (
                 <>
                 <p>No safes</p>

                 </>
             )
        }
        </>
    )
    
}
    
    
  
export default Guardians;
