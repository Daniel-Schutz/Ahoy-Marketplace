module.exports = (req, res) => {
    const { metadataURL, uuid, hourlyPrice, dailyPrice, bool, refundabilityPeriod, deposit, closedPeriod, sellPrice } = req.body;
    
    console.log(metadataURL,uuid, hourlyPrice, dailyPrice, bool, refundabilityPeriod, deposit, closedPeriod, sellPrice)

    // this is the final call for when they put it to rent
    await rentalTermsContract.setRentalTerms(
      tokenId,
      adjustedHourlyPrice,
      adjustedDailyPrice,
      closedPeriod,
      refundabilityPeriod,
      securityDeposit
    );

    // this is the final call for when they put it for sale
    await marketContract.createListedToken(tokenId, sellPrice);
 
  };