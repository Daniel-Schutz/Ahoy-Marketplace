module.exports = (req, res) => {
    const { boat_uuid, account_address, price } = req.body;

		const tokenId = await ahoyTokenizedBoats.fromUuid('sample-uuid');
		
		const priceofboat = await ahoyMarket.getAskingPrice(tokenId);

		// Execute the sale
		await ahoyMarket.executeSale(tokenId);

};
