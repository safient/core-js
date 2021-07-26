const { Client, PrivateKey, ThreadID, Where } = require('@textile/hub');
const { randomBytes } = require('crypto');
const { getThreadId } = require('../../dist/utils/threadDb');
const chai = require('chai');
const { writeFile } = require('fs').promises

const expect = chai.expect;
chai.use(require('chai-as-promised'));

// Import package
const { SafientSDK } = require('../../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');

describe('Safient SDK Test Part 1', async () => {
  // Clean up (delete users)
  // afterEach(async () => {
  //   const seed = new Uint8Array(randomBytes(32));
  //   const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(seed));
  //   const client = await Client.withKeyInfo({
  //     key: `${process.env.USER_API_KEY}`,
  //     secret: `${process.env.USER_API_SECRET}`,
  //   });
  //   await client.getToken(identity);
  //   const threadId = ThreadID.fromBytes(Uint8Array.from(await getThreadId()));
  //   // DELETE : delete user A
  //   const query = new Where('email').eq('creator@test.com');
  //   const result = await client.find(threadId, 'Users', query);

  //   if (result.length < 1) return;

  //   const ids = await result.map((instance) => instance._id);
  //   await client.delete(threadId, 'Users', ids);
  // });
  let creatorSeed = [
    49, 118,  10, 108, 115, 162, 224, 171,
   126, 224, 156,  98, 116, 222,  53,  94,
   153, 255,  30, 159,  88, 239, 251, 229,
    77, 132, 237, 146,  34,  42, 251,  77
 ];
  let beneficiarySeed = [
    99, 222, 247, 252, 228, 180, 160, 225,
   112,   9,  41, 254,  56,  37,  28,  56,
    56,  44,  55, 187, 139,  16, 244,  70,
   107, 103, 205,  44,  48,  11, 127,  34
 ];
  let guardianOneSeed = [
    242,  13,  38, 120,  10,  85, 229,   1,
     72, 172, 240, 121,  48, 199,  63, 252,
    216,   2, 142, 240, 145, 151,   8,  67,
    160,  83, 102, 222, 202, 194,  44, 185
  ];
  let guardianTwoSeed = [
    190,  29, 100, 155,  95, 110,  85, 129,
     72, 196,  77,  15, 183,  13, 145,  38,
    116, 110, 149,  17,  95, 148, 143,  76,
    201,   8, 233, 109,  61, 197, 245, 170
  ];
  let guardianThreeSeed = [
    159, 103,  41,  70, 207, 206,  11,  58,
    198, 237, 231, 173,   0, 240, 213, 182,
     19,  24, 116,   6, 100,  37, 122, 249,
     27, 194,  58,  66,  97,  86, 177,   6
  ];
  let creator;
  let beneficiary;
  let guardianOne;
  let guardianTwo;
  let guardianThree;
  let safeId;
  let provider, chainId;
  let creatorSigner, beneficiarySigner, guardianOneSigner, guardianTwoSigner, guardianThreeSigner;


  before(async() => {
    provider = new JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    chainId = network.chainId;

    creatorSigner = await provider.getSigner(1);
    
    beneficiarySigner = await provider.getSigner(2);
    guardianOneSigner = await provider.getSigner(3);
    guardianTwoSigner = await provider.getSigner(4);
    guardianThreeSigner = await provider.getSigner(5);
    pseudoAccount = await provider.getSigner(6)
  })
  //Step 1: Register all users
  it('Should register a Creator', async () => {
    try {
      // const seed = new Uint8Array(randomBytes(32));
      const sc = new SafientSDK(creatorSigner, chainId);
      creator = await sc.safientCore.connectUser();
      // SUCCESS : create user A
      
      const userAddress = await creatorSigner.getAddress()
      await sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress)).to.be.ok

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(creator, creator.idx.id);
      expect(loginUser.name).to.equal('Creator');
      expect(loginUser.email).to.equal('creator@test.com');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should register a beneficiary', async () => {
    try {

      const sc = new SafientSDK(beneficiarySigner, chainId);
      beneficiary = await sc.safientCore.connectUser();
      // SUCCESS : create user A

      const userAddress = await beneficiarySigner.getAddress()
      await sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(beneficiary, beneficiary.idx.id);
      expect(loginUser.name).to.equal('beneficiary');
      expect(loginUser.email).to.equal('beneficiary@test.com');
    } catch (e) {
      console.log(e);
    }
  });


  it('Should register a Guardian 1', async () => {
    try {

      const sc = new SafientSDK(guardianOneSigner, chainId);
      guardianOne = await sc.safientCore.connectUser();
      // SUCCESS : create user A
      const userAddress = await guardianOneSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianOne, guardianOne.idx.id);
      expect(loginUser.name).to.equal('Guardian 1');
      expect(loginUser.email).to.equal('guardianOne@test.com');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should register a Guardian 2', async () => {
    try {
      const sc = new SafientSDK(guardianTwoSigner, chainId);
      guardianTwo = await sc.safientCore.connectUser();
      // SUCCESS : create user A
      const userAddress = await guardianTwoSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianTwo, guardianTwo.idx.id);
      expect(loginUser.name).to.equal('Guardian 2');
      expect(loginUser.email).to.equal('guardianTwo@test.com');
    } catch (e) {
      console.log(e);
    }
  });

  it('Should register a Guardian 3', async () => {
    try {
      const sc = new SafientSDK(guardianThreeSigner, chainId);
      guardianThree = await sc.safientCore.connectUser();

      const userAddress = await guardianThreeSigner.getAddress()
      await sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress);

      // FAILURE : try creating user A again
      await expect(sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress)).to.be.rejectedWith(Error);

      // SUCCESS : get all users (check if the user A was created)
      const loginUser = await sc.safientCore.getLoginUser(guardianThree, guardianThree.idx.id);
      expect(loginUser.name).to.equal('Guardian 3');
      expect(loginUser.email).to.equal('guardianThree@test.com');

    } catch (e) {
      console.log(e);
    }
  });

  //should create a safe onChain and offChain
  it('Should create safe with "Testing Safe data" as data offchain', async () => {
    try {
      const sc = new SafientSDK(creatorSigner, chainId);
      safeId = await sc.safientCore.createNewSafe(creator, beneficiary, creator.idx.id, beneficiary.idx.id, "Testing safe Data", false)
      const config = {
        safeId: safeId
      }
      await writeFile('./test/negativeTests/safe.json', JSON.stringify(config))
      const safeData = await sc.safientCore.getSafeData(creator, safeId);
      expect(safeData.creator).to.equal(creator.idx.id);
    } catch (e) {
      console.log(e);
    }
  });



  //Step 3: Create a claim
  it('Should create a claim', async () => {
    try {
      const sc = new SafientSDK(beneficiarySigner, chainId);
      const file = {
        name: "signature.jpg"
      }
      const result = await sc.safientCore.claimSafe(beneficiary, safeId, file, "Testing Evidence", "Lorsem Text")
      expect(result).to.equal(true);
    } catch (e) {
      console.log(e);
    }
  });

  //   it('Should get OnChain safe data', async () => {
  //   try {
  //     const sc = new SafientSDK(pseudoAccount, chainId);
  //     await sc.safientCore.getOnChainData(safeId);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });

  // it('Should get offChain safe data', async () => {
  //   try {
  //     const sc = new SafientSDK(beneficiarySigner, chainId);
  //     const data = await sc.safientCore.getSafeData(beneficiary,safeId);
  //     console.log(data)
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });

  // it('should get claim data', async() => {
  //     try{
  //         const sc = new SafientSDK(pseudoAccount, chainId);
  //         await sc.safientCore.getOnChainClaimData(1);
  //         // console.log(beneficiarySigner.getBalance())
  //     }catch(e){
  //         console.log(e)
  //     }
  // })
});
