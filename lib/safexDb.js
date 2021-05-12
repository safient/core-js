const { Client, Where, ThreadID } = require('@textile/hub')
const shamirs = require("shamirs-secret-sharing");

import { getCredentials } from "../utils/threadDb"

export const checkEmailExists = async function(email){
    try{
        const {threadDb, client} = await getCredentials()
        const threadId = ThreadID.fromBytes(threadDb)
        const query = new Where('email').eq(email)
        const result = await client.find(threadId, 'Users', query)
        if (result.length===1){
            return {
                status: false,
                user: result[0]
            }
        }
        return {status:true}
    }catch (e){
        console.log("Error:",e)
        return {status: false}
    }
}

export const registerNewUser = async function(did, name, email, signUpMode){
    try {
        console.log("mode:",signUpMode)
        //generate aes key for the user
        const {threadDb, client} = await getCredentials()
        const threadId = ThreadID.fromBytes(threadDb)
        const data = {
            did:did,
            name: name,
            email: email,
            safes: [],
            signUpMode: signUpMode
        }

        const query = new Where('did').eq(did)
        const result = await client.find(threadId, 'Users', query)
        if (result.length<1){
            await client.create(threadId, 'Users', [data])
            return data
        }
        console.log("User already exists!!")
        return false
    }catch(err){
        console.log("err:",err)
        return false
    }
}

export const getLoginUser = async function(did){
    try {
        const {client, threadDb} = await getCredentials()
        const query = new Where('did').eq(did)
        const threadId = ThreadID.fromBytes(threadDb)
        const result = await client.find(threadId, 'Users', query)

        if (result.length<1){
            console.log("Please register user!")
            return null
        }
        return result[0]
    }catch (err) {
        console.log("err:",err)
        return null
    }
}

export const getAllUsers = async function(did){
    try {
        const {threadDb, client} = await getCredentials()
        const threadId = ThreadID.fromBytes(threadDb)
        const registeredUsers = await client.find(threadId, 'Users', {})
        let caller
        let userArray = []
        console.log("Registered users:", registeredUsers)

        for (let i=0;i<registeredUsers.length;i++){
            const result = registeredUsers[i]
            const value = {
                name: result.name,
                email: result.email,
                did: result.did
            }
            if (did.toLowerCase() === result.did.toLowerCase()) {
                caller = value
            }
            else {
                userArray.push(value)
            }
        }

        return {
            userArray: userArray,
            caller: caller
        }
    }catch (e){
        console.log("err:",e)
        return null
    }
}

export const sharePortfolio = async function(sender, receiver, documentId, encKey, requestId){
    try{
        console.log("sender:",sender)
        console.log("receiver:", receiver)
        console.log("id:",requestId)
        const {threadDb, client} = await getCredentials()
        const threadId = ThreadID.fromBytes(threadDb)

        // update sender sharedWith array
        let query = new Where('did').eq(sender.did)
        let user = await client.find(threadId, 'RegisterUser', query)
        if(user[0].docID === '0'){
            user[0].docID = documentId
        }
        if (user[0].sharedWith.length===0){
            user[0].sharedWith = [receiver.senderDid]
        }else {
            user[0].sharedWith.push(receiver.senderDid)
        }

        user[0].requests = user[0].requests.filter((item) => item.requestId !== requestId)
        console.log("Removed!!")

        await client.save(threadId,'RegisterUser',[user[0]])

        // update receiver sharedData array
        query = new Where('did').eq(receiver.senderDid)
        user = await client.find(threadId, 'RegisterUser', query)
        if (user[0].sharedData.length===0){
            user[0].sharedData = [{
                encryptedKey: encKey,
                documentId: documentId,
                senderName: sender.name,
                senderEmail: sender.email,
                senderDid: sender.did
            }]
        }else {
            user[0].sharedData.push({
                encryptedKey: encKey,
                documentId: documentId,
                senderName: sender.name,
                senderEmail: sender.email,
                senderDid: sender.did
            })
        }
        await client.save(threadId,'RegisterUser',[user[0]])
        return true
    }catch (e) {
        console.log("Err:",e)
        return false
    }

}

export const rejectPortfolioRequest = async function(sender, requestId){
    const {threadDb, client} = await getCredentials()
    const threadId = ThreadID.fromBytes(threadDb)

    try{
        // update sender sharedWith array
        let query = new Where('did').eq(sender.did)
        let user = await client.find(threadId, 'RegisterUser', query)
        user[0].requests = user[0].requests.filter((item) => item.requestId !== requestId)
        console.log("Removed!!")
        await client.save(threadId,'RegisterUser',[user[0]])
        return true
    }catch (e) {
        console.log("Error:",e)
        return false
    }
}

export const updateName = async function(name, email){
    const {threadDb, client} = await getCredentials()
    const threadId = ThreadID.fromBytes(threadDb)
    try{
        let query = new Where('email').eq(email)
        let user = await client.find(threadId, 'Users', query)
        user[0].name = name
        await client.save(threadId,'Users',[user[0]])
        console.log("updated!!")
        return true
    }catch (e) {
        console.log("Error:",e)
        return false
    }
}

export const updateDocID = async function(email, docID){
    const {threadDb, client} = await getCredentials()
    const threadId = ThreadID.fromBytes(threadDb)
    try{
        let query = new Where('email').eq(email)
        let user = await client.find(threadId, 'RegisterUser', query)
        user[0].docID = docID
        await client.save(threadId,'RegisterUser',[user[0]])
        console.log("updated!!")
        return true
    }catch (e) {
        console.log("Error:",e)
        return false
    }
}

export const requestPortfolio = async function(sender, receiver){
    const {threadDb, client} = await getCredentials()
    const threadId = ThreadID.fromBytes(threadDb)
    let query = new Where('did').eq(receiver.did)
    let user = await client.find(threadId, 'RegisterUser', query)
    if (user[0].requests.length===0) {
        user[0].requests = [{
            senderDid:sender.did,
            name: sender.name,
            requestId: user[0].requests.length+1
        }]
    }else {
        user[0].requests.push({
            senderDid:sender.did,
            name: sender.name,
            requestId: user[0].requests.length+1
        })
    }
    await client.save(threadId,'RegisterUser',[user[0]])

    query = new Where('did').eq(sender.did)
    user = await client.find(threadId, 'RegisterUser', query)
    if (user[0].requested.length===0) {
        user[0].requested = [{
            receiverDid:receiver.did,
            name: receiver.name
        }]
    }else {
        user[0].requested.push({
            receiverDid:receiver.did,
            name: receiver.name
        })
    }
    await client.save(threadId,'RegisterUser',[user[0]])
    return true
}


export const createNewSafe = async function(creator, recipient, encryptedKey, recipentEnc, encryptedData,idx ){
    try {

        //generate aes key for the user
        const {threadDb, client} = await getCredentials()
        const threadId = ThreadID.fromBytes(threadDb)

        const secretShares = shamirs.split(JSON.stringify(recipentEnc), {shares: 3, threshold: 2})
        console.log(secretShares);

        const guardianOne = await checkEmailExists("guardianOne@gmail.com");
        const guardianTwo = await checkEmailExists("guardianTwo@gmail.com");
        const guardianThree = await checkEmailExists("guardianThree@gmail.com");

        const shardOne = await idx.ceramic.did.createDagJWE(secretShares[0], [guardianOne.user.did]);
        const shardTwo = await idx.ceramic.did.createDagJWE(secretShares[1], [guardianTwo.user.did]);
        const shardThree = await idx.ceramic.did.createDagJWE(secretShares[2], [guardianThree.user.did]);

        const shardData = [
            {
                status: 0, 
                encShard : shardOne, 
                decData: null
            },
            {
                status: 0, 
                encShard : shardTwo, 
                decData: null
            },
            {
                status: 0, 
                encShard : shardThree, 
                decData: null
            }
        ]

        const data = {
            creator: creator,
            guardians: [],
            recipient: recipient,
            encSafeKey: encryptedKey,
            encSafeData: encryptedData,
            stage: 0,
            encSafeKeyShards: shardData,
        }

        const safe = await client.create(threadId, 'Safes', [data])
        console.log(safe)

        const creatorQuery = new Where('did').eq(creator)
        const recipientQuery = new Where('did').eq(recipient)
        let creatorUser = await client.find(threadId, 'Users', creatorQuery)
        let recipientUser = await client.find(threadId, 'Users', recipientQuery)

        console.log(creatorUser)

        if (creatorUser[0].safes===0) {
            creatorUser[0].safes = [{
                safeId: safe[0],
                type: 'creator'
            }]
        }else {
            creatorUser[0].safes.push({
                safeId: safe[0],
                type: 'creator'
            })
        }

        if (recipientUser[0].safes===0) {
            creatorUser[0].safes = [{
                safeId: safe[0],
                type: 'recipient'
            }]
        }else {
            recipientUser[0].safes.push({
                safeId: safe[0],
                type: 'recipient'
            })
        }

        if (guardianOne.user.safes===0) {
            guardianOne.user.safes = [{
                safeId: safe[0],
                type: 'guardian'
            }]
        }else {
            guardianOne.user.safes.push({
                safeId: safe[0],
                type: 'guardian'
            })
        }

        if (guardianTwo.user.safes===0) {
            guardianTwo.user.safes = [{
                safeId: safe[0],
                type: 'guardian'
            }]
        }else {
            guardianTwo.user.safes.push({
                safeId: safe[0],
                type: 'guardian'
            })
        }

        if (guardianThree.user.safes===0) {
            guardianThree.user.safes = [{
                safeId: safe[0],
                type: 'guardian'
            }]
        }else {
            guardianThree.user.safes.push({
                safeId: safe[0],
                type: 'guardian'
            })
        }

        await client.save(threadId,'Users',[creatorUser[0]])
        await client.save(threadId,'Users',[recipientUser[0]])
        await client.save(threadId, 'Users', [guardianOne.user])
        await client.save(threadId, 'Users', [guardianTwo.user])
        await client.save(threadId, 'Users', [guardianThree.user])
        return true
    }catch(err){
        console.log("err:",err)
        return false
    }
}

export const getSafeData = async function(safeId) {
    try {
        const {client, threadDb} = await getCredentials()
        const query = new Where('_id').eq(safeId)
        const threadId = ThreadID.fromBytes(threadDb)
        const result = await client.find(threadId, 'Safes', query)

        if (result.length){
            return result[0]
        }
        
    }catch (err) {
        console.log("err:",err)
        return null
    }
}
    

export const claimSafe = async (safeId) => {
    const {client, threadDb} = await getCredentials()
    try{
        const query = new Where('_id').eq(safeId)
        const threadId = ThreadID.fromBytes(threadDb)
        const result = await client.find(threadId, 'Safes', query)

        if(result[0].stage === 0){
            result[0].stage = 1
        }
        await client.save(threadId,'Safes',[result[0]])
        return true
    }catch(err){
        console.log(err)
        return false
    }
        
}

export const decryptShards = async (idx, safeId, shard) => {
    const {client, threadDb} = await getCredentials()
    try{
        const query = new Where('_id').eq(safeId)
        const threadId = ThreadID.fromBytes(threadDb)
        const result = await client.find(threadId, 'Safes', query)

        if(result[0].stage === 1){
            result[0].stage = 2
        }

        const decShard = await idx.ceramic.did.decryptDagJWE(
            result[0].encSafeKeyShards[shard].encShard
          )
        result[0].encSafeKeyShards[shard].status = 1
        result[0].encSafeKeyShards[shard].decData = decShard

        await client.save(threadId,'Safes',[result[0]])
        
        return true
       
    }catch(err){
        console.log(err)
        return false
    }
}
