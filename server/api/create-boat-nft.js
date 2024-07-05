module.exports = (req, res) => {
    const { metadataURL, uuid, hourlyPrice, dailyPrice, bool, refundabilityPeriod, deposit, closedPeriod, sellPrice } = req.body;
    
    console.log(metadataURL,uuid, hourlyPrice, dailyPrice, bool, refundabilityPeriod, deposit, closedPeriod, sellPrice)
 
  };