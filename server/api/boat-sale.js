module.exports = async (req, res) => {
    const {boat_uuid} = req.body;

    try {
        const tokenId = await ahoyTokenizedBoats.fromUuid(boat_uuid);
       
        // Execute the sale
        await ahoyMarket.executeSale(tokenId);

     
        res.status(200).send({ success: true });
    } catch (error) {
       
        res.status(500).send({ success: false, error: error.message });
    }
};
