module.exports = (req, res) => {
    const { metadataURL, uuid, hourlyPrice, dailyPrice, bool, refundabilityPeriod, deposit, closedPeriod, sellPrice } = req.body;
    const { ethers } = require('hardhat');
    const { expect } = require('chai');
    const { deployContract } = require('./utils/setup');

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
    it('should execute the sale of a listed boat and transfer the correct amount of USDC', async function () {
		// Mint a new boat token
		const mintTx = await ahoyTokenizedBoats
			.connect(deployer)
			.mintTo(accounts[0].address, 'sale-boat-uuid');
		await mintTx.wait();

		const tokenId = await ahoyTokenizedBoats.fromUuid('sale-boat-uuid');
		expect(tokenId).to.not.equal(0);

		// Approve the market contract to transfer the token
		await ahoyTokenizedBoats
			.connect(accounts[0])
			.approve(ahoyMarket.target, tokenId);

		// List the boat for sale
		const price = ethers.parseUnits('1000', 'ether');
		await ahoyMarket.connect(accounts[0]).createListedToken(tokenId, price);

		// Get initial balances of buyer and seller
		const initialSellerBalance = ethers.toBigInt(
			await usdc.balanceOf(accounts[0].address)
		);
		const initialBuyerBalance = ethers.toBigInt(
			await usdc.balanceOf(accounts[1].address)
		);

		// Convert the balances to a readable format (in USDC)
		const formattedSellerBalance = ethers.formatUnits(initialSellerBalance, 18);
		const formattedBuyerBalance = ethers.formatUnits(initialBuyerBalance, 18);

		console.log(`Initial seller balance: ${formattedSellerBalance} USDC`);
		console.log(`Initial buyer balance: ${formattedBuyerBalance} USDC`);

		// Approve the buyer to transfer USDC to the seller
		await usdc.connect(accounts[1]).approve(ahoyMarket.target, price);

		// Execute the sale
		await ahoyMarket.connect(accounts[1]).executeSale(tokenId);

		// Verify that the ownership of the token has been transferred
		const newOwner = await ahoyTokenizedBoats.ownerOf(tokenId);
		expect(newOwner).to.equal(accounts[1].address);

		// Verify that the asking price has been deleted
		const askingPrice = await ahoyMarket.getAskingPrice(tokenId);
		expect(askingPrice).to.equal(0);

		// Verify the final balances of buyer and seller
		const finalSellerBalance = ethers.toBigInt(
			await usdc.balanceOf(accounts[0].address)
		);
		const finalBuyerBalance = ethers.toBigInt(
			await usdc.balanceOf(accounts[1].address)
		);

		const expectedSellerBalance = initialSellerBalance + ethers.toBigInt(price);
		const expectedBuyerBalance = initialBuyerBalance - ethers.toBigInt(price);

		const formattedFinalSellerBalance = ethers.formatUnits(
			finalSellerBalance,
			18
		);
		const formattedFinalBuyerBalance = ethers.formatUnits(
			finalBuyerBalance,
			18
		);

		console.log(`Final seller balance: ${formattedFinalSellerBalance} USDC`);
		console.log(`Final buyer balance: ${formattedFinalBuyerBalance} USDC`);

		expect(finalSellerBalance).to.equal(expectedSellerBalance);
		expect(finalBuyerBalance).to.equal(expectedBuyerBalance);
	});
});
  };