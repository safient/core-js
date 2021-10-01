import { Client, PrivateKey, ThreadID } from '@textile/hub';
import {getThreadId} from "../../utils/threadDb"

export const thread = async(seed: any, apiKey:string, secret: string) => {
 try{
    const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(seed));
      const client = await Client.withKeyInfo({
        key: apiKey,
        secret: secret,
      });
      await client.getToken(identity);
      const threadId = ThreadID.fromBytes(Uint8Array.from(await getThreadId()));
      return {client, threadId}
 }catch(err){
    throw new Error("Error while creating threadData")
 }
}