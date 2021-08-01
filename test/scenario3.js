const { ThreadID } = require('@textile/hub');
const { SafientClaims } = require('@safient/claims');
const { utils } = require('ethers');
const { getThreadId } = require('../dist/utils/threadDb');
const fs = require('fs');
const chai = require('chai');

const expect = chai.expect;
chai.use(require('chai-as-promised'));

const { SafientSDK } = require('../dist/index');
const { JsonRpcProvider } = require('@ethersproject/providers');

describe('Scenario 3 - Creating safe onChain and Passed the dispute', async () => {
    let admin;
    let creator;
    let beneficiary;
    let guardianOne;
    let guardianTwo;
    let guardianThree;
    let safeId;
    let provider, chainId;
    let creatorSigner, beneficiarySigner, guardianOneSigner, guardianTwoSigner, guardianThreeSigner;
    let disputeId

  before(async () => {
    provider = new JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    chainId = network.chainId;

    admin = await provider.getSigner(0)
    creatorSigner = await provider.getSigner(1);
    
    beneficiarySigner = await provider.getSigner(2);
    guardianOneSigner = await provider.getSigner(3);
    guardianTwoSigner = await provider.getSigner(4);
    guardianThreeSigner = await provider.getSigner(5);
    pseudoAccount = await provider.getSigner(6)
  })
  //Step 1: Register all users
  it('Should register a Creator', async () => {
  
    const sc = new SafientSDK(creatorSigner, chainId);
    creator = await sc.safientCore.connectUser();
    
    const userAddress = await creatorSigner.getAddress()
    await sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(sc.safientCore.registerNewUser(creator, 'Creator', 'creator@test.com', 0, userAddress)).to.eventually.be.eql('creator@test.com already registered.')

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await sc.safientCore.getLoginUser(creator, creator.idx.id);
    expect(loginUser.name).to.equal('Creator');
    expect(loginUser.email).to.equal('creator@test.com');

});

it('Should register a beneficiary', async () => {
  
    const sc = new SafientSDK(beneficiarySigner, chainId);
    beneficiary = await sc.safientCore.connectUser();
    // SUCCESS : create user A

    const userAddress = await beneficiarySigner.getAddress()
    await sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(sc.safientCore.registerNewUser(beneficiary, 'beneficiary', 'beneficiary@test.com', 0, userAddress)).to.eventually.be.eql('beneficiary@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await sc.safientCore.getLoginUser(beneficiary, beneficiary.idx.id);
    expect(loginUser.name).to.equal('beneficiary');
    expect(loginUser.email).to.equal('beneficiary@test.com');
});


it('Should register a Guardian 1', async () => {
    const sc = new SafientSDK(guardianOneSigner, chainId);
    guardianOne = await sc.safientCore.connectUser();
    // SUCCESS : create user A
    const userAddress = await guardianOneSigner.getAddress()
    await sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(sc.safientCore.registerNewUser(guardianOne, 'Guardian 1', 'guardianOne@test.com', 0, userAddress)).to.eventually.be.eql('guardianOne@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await sc.safientCore.getLoginUser(guardianOne, guardianOne.idx.id);
    expect(loginUser.name).to.equal('Guardian 1');
    expect(loginUser.email).to.equal('guardianOne@test.com');
});

it('Should register a Guardian 2', async () => {
    const sc = new SafientSDK(guardianTwoSigner, chainId);
    guardianTwo = await sc.safientCore.connectUser();
    // SUCCESS : create user A
    const userAddress = await guardianTwoSigner.getAddress()
    await sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(sc.safientCore.registerNewUser(guardianTwo, 'Guardian 2', 'guardianTwo@test.com', 0, userAddress)).to.eventually.be.eql('guardianTwo@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await sc.safientCore.getLoginUser(guardianTwo, guardianTwo.idx.id);
    expect(loginUser.name).to.equal('Guardian 2');
    expect(loginUser.email).to.equal('guardianTwo@test.com');
});

it('Should register a Guardian 3', async () => {
    const sc = new SafientSDK(guardianThreeSigner, chainId);
    guardianThree = await sc.safientCore.connectUser();

    const userAddress = await guardianThreeSigner.getAddress()
    await sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress);

    // FAILURE : try creating user A again
    await expect(sc.safientCore.registerNewUser(guardianThree, 'Guardian 3', 'guardianThree@test.com', 0, userAddress)).to.eventually.be.eql('guardianThree@test.com already registered.');

    // SUCCESS : get all users (check if the user A was created)
    const loginUser = await sc.safientCore.getLoginUser(guardianThree, guardianThree.idx.id);
    expect(loginUser.name).to.equal('Guardian 3');
    expect(loginUser.email).to.equal('guardianThree@test.com');
});

  describe('Safe creation and claim creation', async () => {
    describe('Onchain', async () => {
      it('Should Create Safe', async () => {
      
          const sc = new SafientSDK(creatorSigner, chainId);
          const userAddress = await creatorSigner.getAddress()

          safeId = await sc.safientCore.createNewSafe(
            creator,
            beneficiary,
            creator.idx.id,
            beneficiary.idx.id,
            'This is a test data',
            true
          );

          // check safe - threadDB
          const safeDataThreadDB = await sc.safientCore.getSafeData(creator, safeId);
          expect(safeDataThreadDB.creator).to.equal(creator.idx.id);

          // check safe - onchain (since this is an onChain=true safe creation)
          const safeDataOnchain = await sc.safientCore.getOnChainData(safeId);
          expect(safeDataOnchain.safeCreatedBy).to.equal(userAddress);
        
      });

      it('Should claim safe', async () => {
      
          const sc = new SafientSDK(beneficiarySigner, chainId);

          const file = {
            name: 'signature.jpg',
          };

          disputeId = await sc.safientCore.claimSafe(
            beneficiary,
            safeId,
            file,
            'Test evidence',
            'This is an evidence description'
          );

          // check claim on the safe - threadDB
          const safeDataThreadDB = await sc.safientCore.getSafeData(beneficiary, safeId);
          expect(safeDataThreadDB.claims[0].createdBy).to.equal(beneficiary.idx.id);
          expect(safeDataThreadDB.claims[0].disputeId).to.equal(disputeId);
          expect(safeDataThreadDB.claims[0].claimStatus).to.equal(0); // claimStages.ACTIVE
          expect(safeDataThreadDB.stage).to.equal(1); // safeStages.CLAIMING
          expect(safeDataThreadDB.beneficiary).to.equal(beneficiary.idx.id);
       
      });
    });
  });

  describe('Ruling...', async () => {
    it('Should PASS ruling on the dispute', async () => {
     
        const sc = new SafientSDK(admin, chainId);

        const result = await sc.safientCore.giveRuling(disputeId, 1) //Passing a claim
        expect(result).to.equal(true);
     
    });
  });


  describe('Sync safe stage', async () => {
    it('Updates the safe stage on threadDB according to the ruling', async () => {
 
        const sc = new SafientSDK(beneficiarySigner, chainId);
     
        const result = await sc.safientCore.syncStage(beneficiary, safeId)
        expect(result).to.equal(true);

        // check safe - threadDB
        const safeDataThreadDB = await sc.safientCore.getSafeData(beneficiary, safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
        expect(safeDataThreadDB.claims[0].claimStatus).to.equal(1); // claimStages.PASSED      
      
    });
  });

  describe('Guardian recovery', async () => {
    it('Recovery done by guardian 1', async () => {
   
        const sc = new SafientSDK(guardianOneSigner, chainId);

        const result = await sc.safientCore.guardianRecovery(guardianOne, safeId, guardianOne.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should still be in RECOVERING stage)
        const safeDataThreadDB = await sc.safientCore.getSafeData(guardianOne, safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
     
    });

    it('Recovery done by guardian 2', async () => {
     
        const sc = new SafientSDK(guardianTwoSigner, chainId);

        const result = await sc.safientCore.guardianRecovery(guardianTwo, safeId, guardianTwo.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should be in RECOVERED stage)
        const safeDataThreadDB = await sc.safientCore.getSafeData(guardianTwo, safeId);
        expect(safeDataThreadDB.stage).to.equal(3); // safeStages.RECOVERED
      
    });
  });

  describe('Beneficiary data recovery', async () => {
    it('Data is recovered by the beneficiary', async () => {
     
        const sc = new SafientSDK(beneficiarySigner, chainId);

        const result = await sc.safientCore.recoverData(beneficiary, safeId, beneficiary.idx.id);

        expect(result.data).to.equal('This is a test data');
      
    });
  });

  describe('Guardian incentivisation', async () => {
    it('Guardian 1 and guardian 2 are incentivised', async () => {
      
        const sc = new SafientSDK(guardianOneSigner, chainId);
        const prevBalance = await guardianOneSigner.getBalance();
        const result = await sc.safientCore.incentiviseGuardians(guardianOne, safeId);
        const newBalance = await guardianOneSigner.getBalance();
        expect((parseInt(newBalance) > parseInt(prevBalance))).to.equal(true);
      
    });
  });
});
