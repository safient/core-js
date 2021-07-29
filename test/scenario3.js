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
  let safeId,
    provider,
    chainId,
    creatorSigner,
    inheritorSigner,
    guardianSigner1,
    guardianSigner2,
    guardianSigner3,
    pseudoSigner,
    creatorAddress,
    inheritorAddress,
    guardianAddress1,
    guardianAddress2,
    guardianAddress3,
    threadID;

  before(async () => {
    provider = new JsonRpcProvider('http://localhost:8545');
    const network = await provider.getNetwork();
    chainId = network.chainId;

    arbitratorSigner = await provider.getSigner(0);
    creatorSigner = await provider.getSigner(11);
    inheritorSigner = await provider.getSigner(12);
    guardianSigner1 = await provider.getSigner(13);
    guardianSigner2 = await provider.getSigner(14);
    guardianSigner3 = await provider.getSigner(15);
    pseudoSigner = await provider.getSigner(16);

    creatorAddress = await creatorSigner.getAddress();
    inheritorAddress = await inheritorSigner.getAddress();
    guardianAddress1 = await guardianSigner1.getAddress();
    guardianAddress2 = await guardianSigner2.getAddress();
    guardianAddress3 = await guardianSigner3.getAddress();

    threadID = ThreadID.fromBytes(Uint8Array.from(await getThreadId()));
  });

  describe('Register all users', async () => {
    it('Creator is registered', async () => {
      try {
        const creator = new SafientSDK(creatorSigner, chainId);
        const creatorConnect = await creator.safientCore.connectUser();

        // SUCCESS : register creator
        await creator.safientCore.registerNewUser(creatorConnect, 'Creatorr', 'creatorr@test.com', 0, creatorAddress);

        // check user
        const loginUser = await creator.safientCore.getLoginUser(creatorConnect, creatorConnect.idx.id);
        expect(loginUser.name).to.equal('Creatorr');
        expect(loginUser.email).to.equal('creatorr@test.com');

        // FAILURE : register creator again
        await expect(
          creator.safientCore.registerNewUser(creatorConnect, 'Creatorr', 'creatorr@test.com', 0, creatorAddress)
        ).to.be.rejectedWith(Error);
      } catch (e) {
        console.log(e);
      }
    });

    it('inheritor is registered', async () => {
      try {
        const inheritor = new SafientSDK(inheritorSigner, chainId);
        const inheritorConnect = await inheritor.safientCore.connectUser();

        // SUCCESS : register inheritor
        await inheritor.safientCore.registerNewUser(
          inheritorConnect,
          'Inheritor',
          'inheritor@test.com',
          0,
          inheritorAddress
        );

        // check user
        const loginUser = await inheritor.safientCore.getLoginUser(inheritorConnect, inheritorConnect.idx.id);
        expect(loginUser.name).to.equal('Inheritor');
        expect(loginUser.email).to.equal('inheritor@test.com');

        // FAILURE : register inheritor again
        await expect(
          inheritor.safientCore.registerNewUser(
            inheritorConnect,
            'Inheritor',
            'inheritor@test.com',
            0,
            inheritorAddress
          )
        ).to.be.rejectedWith(Error);
      } catch (e) {
        console.log(e);
      }
    });

    it('guardian 1 is registered', async () => {
      try {
        const guardian1 = new SafientSDK(guardianSigner1, chainId);
        const guardian1Connect = await guardian1.safientCore.connectUser();

        // SUCCESS : register guardian 1
        await guardian1.safientCore.registerNewUser(
          guardian1Connect,
          'Guardian1',
          'guardian1@test.com',
          0,
          guardianAddress1
        );

        // check user
        const loginUser = await guardian1.safientCore.getLoginUser(guardian1Connect, guardian1Connect.idx.id);
        expect(loginUser.name).to.equal('Guardian1');
        expect(loginUser.email).to.equal('guardian1@test.com');

        // FAILURE : register guardian 1 again
        await expect(
          guardian1.safientCore.registerNewUser(
            guardian1Connect,
            'Guardian1',
            'guardian1@test.com',
            0,
            guardianAddress1
          )
        ).to.be.rejectedWith(Error);
      } catch (e) {
        console.log(e);
      }
    });

    it('guardian 2 is registered', async () => {
      try {
        const guardian2 = new SafientSDK(guardianSigner2, chainId);
        const guardian2Connect = await guardian2.safientCore.connectUser();

        // SUCCESS : register guardian 2
        await guardian2.safientCore.registerNewUser(
          guardian2Connect,
          'Guardian2',
          'guardian2@test.com',
          0,
          guardianAddress2
        );

        // check user
        const loginUser = await guardian2.safientCore.getLoginUser(guardian2Connect, guardian2Connect.idx.id);
        expect(loginUser.name).to.equal('Guardian2');
        expect(loginUser.email).to.equal('guardian2@test.com');

        // FAILURE : register guardian 2 again
        await expect(
          guardian2.safientCore.registerNewUser(
            guardian2Connect,
            'Guardian2',
            'guardian2@test.com',
            0,
            guardianAddress2
          )
        ).to.be.rejectedWith(Error);
      } catch (e) {
        console.log(e);
      }
    });

    it('guardian 3 is registered', async () => {
      try {
        const guardian3 = new SafientSDK(guardianSigner3, chainId);
        const guardian3Connect = await guardian3.safientCore.connectUser();

        // SUCCESS : register guardian 3
        await guardian3.safientCore.registerNewUser(
          guardian3Connect,
          'Guardian3',
          'guardian3@test.com',
          0,
          guardianAddress3
        );

        // check user
        const loginUser = await guardian3.safientCore.getLoginUser(guardian3Connect, guardian3Connect.idx.id);
        expect(loginUser.name).to.equal('Guardian3');
        expect(loginUser.email).to.equal('guardian3@test.com');

        // FAILURE : register guardian 3 again
        await expect(
          guardian3.safientCore.registerNewUser(
            guardian3Connect,
            'Guardian3',
            'guardian3@test.com',
            0,
            guardianAddress3
          )
        ).to.be.rejectedWith(Error);
      } catch (e) {
        console.log(e);
      }
    });
  });

  describe('Safe creation and claim creation', async () => {
    describe('Onchain', async () => {
      it('safe is created by the creator', async () => {
        try {
          const creator = new SafientSDK(creatorSigner, chainId);
          const creatorConnect = await creator.safientCore.connectUser();

          const inheritor = new SafientSDK(inheritorSigner, chainId);
          const inheritorConnect = await inheritor.safientCore.connectUser();

          safeId = await creator.safientCore.createNewSafe(
            creatorConnect,
            inheritorConnect,
            creatorConnect.idx.id,
            inheritorConnect.idx.id,
            'This is a test data',
            true
          );

          // check safe - threadDB
          const safeDataThreadDB = await creator.safientCore.getSafeData(creatorConnect, safeId);
          expect(safeDataThreadDB.creator).to.equal(creatorConnect.idx.id);
          expect(safeDataThreadDB.beneficiary).to.equal(inheritorConnect.idx.id);

          // check safe - onchain (since this is an onChain=true safe creation)
          const safeDataOnchain = await creator.safientCore.getOnChainData(safeId);
          expect(safeDataOnchain.safeCreatedBy).to.equal(creatorAddress);
          expect(safeDataOnchain.safeInheritor).to.equal(inheritorAddress);
        } catch (e) {
          console.log(e);
        }
      });

      it('safe is claimed by the inheritor', async () => {
        try {
          const inheritor = new SafientSDK(inheritorSigner, chainId);
          const inheritorConnect = await inheritor.safientCore.connectUser();

          const file = {
            name: 'signature.jpg',
          };

          const disputeId = await inheritor.safientCore.claimSafe(
            inheritorConnect,
            safeId,
            file,
            'Test evidence',
            'This is an evidence description'
          );

          // check claim on the safe - threadDB
          const safeDataThreadDB = await inheritor.safientCore.getSafeData(inheritorConnect, safeId);
          expect(safeDataThreadDB.claims[0].createdBy).to.equal(inheritorConnect.idx.id);
          expect(safeDataThreadDB.claims[0].disputeId).to.equal(disputeId);
          expect(safeDataThreadDB.claims[0].claimStatus).to.equal(0); // claimStages.ACTIVE
          expect(safeDataThreadDB.stage).to.equal(1); // safeStages.CLAIMING
          expect(safeDataThreadDB.beneficiary).to.equal(inheritorConnect.idx.id);

          // check claim on the safe - onchain
          const safeDataOnchain = await inheritor.safientCore.getOnChainData(safeId);
          expect(safeDataOnchain.claimsCount.toNumber()).to.equal(1);
        } catch (e) {
          console.log(e);
        }
      });
    });
  });

  describe('Ruling...', async () => {
    it('Claim is passed by the arbitrator', async () => {
      try {
        const pseudo = new SafientSDK(pseudoSigner, chainId);
        const pseudoConnect = await pseudo.safientCore.connectUser();
        const safeDataThreadDB = await pseudo.safientCore.getSafeData(pseudoConnect, safeId);

        const claimsSDK = new SafientClaims(arbitratorSigner, chainId);

        // give ruling - Passed
        const result = await claimsSDK.arbitrator.giveRulingCall(safeDataThreadDB.claims[0].disputeId, 1);

        expect(result).to.equal(true);
        expect(await claimsSDK.safientMain.getClaimStatus(safeDataThreadDB.claims[0].disputeId)).to.equal(1);
      } catch (e) {
        console.log(e);
      }
    });
  });

  describe('Sync safe stage', async () => {
    it('Updates the safe stage on threadDB according to the ruling', async () => {
      try {
        const pseudo = new SafientSDK(pseudoSigner, chainId);
        const pseudoConnect = await pseudo.safientCore.connectUser();

        const result = await pseudo.safientCore.syncStage(pseudoConnect, safeId);
        expect(result).to.equal(true);

        // check safe - threadDB
        const safeDataThreadDB = await pseudo.safientCore.getSafeData(pseudoConnect, safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
        expect(safeDataThreadDB.claims[0].claimStatus).to.equal(1); // claimStages.PASSED

        // check safe - onchain (since this is an onChain=true safe creation)
        const claimsSDK = new SafientClaims(pseudoSigner, chainId);
        expect(await claimsSDK.safientMain.getClaimStatus(safeDataThreadDB.claims[0].disputeId)).to.equal(1);
      } catch (e) {
        console.log(e);
      }
    });
  });

  describe('Guardian recovery', async () => {
    it('Recovery done by guardian 1', async () => {
      try {
        const guardian1 = new SafientSDK(guardianSigner1, chainId);
        const guardian1Connect = await guardian1.safientCore.connectUser();

        const result = await guardian1.safientCore.guardianRecovery(guardian1Connect, safeId, guardian1Connect.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should still be in RECOVERING stage)
        const safeDataThreadDB = await guardian1.safientCore.getSafeData(guardian1Connect, safeId);
        expect(safeDataThreadDB.stage).to.equal(2); // safeStages.RECOVERING
      } catch (e) {
        console.log(e);
      }
    });

    it('Recovery done by guardian 2', async () => {
      try {
        const guardian2 = new SafientSDK(guardianSigner2, chainId);
        const guardian2Connect = await guardian2.safientCore.connectUser();

        const result = await guardian2.safientCore.guardianRecovery(guardian2Connect, safeId, guardian2Connect.idx.id);
        expect(result).to.equal(true);

        // check safe - threadDB (safe stage should be in RECOVERED stage)
        const safeDataThreadDB = await guardian2.safientCore.getSafeData(guardian2Connect, safeId);
        expect(safeDataThreadDB.stage).to.equal(3); // safeStages.RECOVERED
      } catch (e) {
        console.log(e);
      }
    });
  });

  describe('Beneficiary data recovery', async () => {
    it('Data is recovered by the beneficiary', async () => {
      try {
        const inheritor = new SafientSDK(inheritorSigner, chainId);
        const inheritorConnect = await inheritor.safientCore.connectUser();

        const result = await inheritor.safientCore.recoverData(inheritorConnect, safeId, inheritorConnect.idx.id);

        expect(result.data).to.equal('This is a test data');
      } catch (e) {
        console.log(e);
      }
    });
  });

  describe('Guardian incentivisation', async () => {
    it('Guardian 1 and guardian 2 are incentivised', async () => {
      try {
        const guardian1 = new SafientSDK(guardianSigner1, chainId);
        const guardian1Connect = await guardian1.safientCore.connectUser();

        const guardian1BeforeBalance = await guardianSigner1.getBalance();
        const guardian2BeforeBalance = await guardianSigner2.getBalance();

        await guardian1.safientCore.incentiviseGuardians(guardian1Connect, safeId);

        const guardian1AfterBalance = await guardianSigner1.getBalance();
        const guardian2AfterBalance = await guardianSigner2.getBalance();

        expect(Number(utils.formatEther(guardian1AfterBalance))).to.be.greaterThan(
          Number(utils.formatEther(guardian1BeforeBalance))
        );
        expect(Number(utils.formatEther(guardian2AfterBalance))).to.be.greaterThan(
          Number(utils.formatEther(guardian2BeforeBalance))
        );
      } catch (e) {
        console.log(e);
      }
    });
  });
});
