const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployContract } = require('./utils/setup');

module.exports = (req, res) => {
    const { boat_uuid, account_address} = req.body;
    
    describe('AhoyMarket', function () {
        let usdc;
        let ahoyTokenizedBoats;
        let ahoyMarket;
        let deployer, accounts;
    
        this.beforeAll(async () => {
            [deployer, ...accounts] = await ethers.getSigners();
            usdc = await deployContract(deployer, 'USDCoin');
            for await (const account of accounts)
                await usdc.connect(account).quickMint();
    
            //this confirms the contract was deployed
            ahoyTokenizedBoats = await deployContract(deployer, 'AhoyTokenizedBoats');
            console.log('AhoyTokenizedBoats deployed at:', ahoyTokenizedBoats.target);
    
            ahoyMarket = await deployContract(deployer, 'AhoyMarket', [
                ahoyTokenizedBoats.target,
                usdc.target,
            ]);
            console.log('AhoyMarket deployed at:', ahoyMarket.target);
        });
    
        it('should list a boat for sale', async function () {
            // Mint a new boat token
            const mintTx = await ahoyTokenizedBoats
                .connect(deployer)
                .mintTo(account_address, boat_uuid);
            await mintTx.wait();
    
            const tokenId = await ahoyTokenizedBoats.fromUuid(boat_uuid);
            expect(tokenId).to.not.equal(0);
    
            // Approve the market contract to transfer the token
            await ahoyTokenizedBoats
                .connect(accounts[0])
                .approve(ahoyMarket.target, tokenId);
    
            // List the boat for sale
            const price = ethers.parseUnits('10', 'ether');
            await ahoyMarket.connect(accounts[0]).createListedToken(tokenId, price);
    
            // This uses the get asking price function and passes
            const askingPrice = await ahoyMarket.getAskingPrice(tokenId);
            expect(askingPrice).to.equal(price);
        });
    })    
 
  };