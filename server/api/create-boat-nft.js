module.exports = async (req, res) => {
  const { tokenId, adjustedHourlyPrice, adjustedDailyPrice, closedPeriod, refundabilityPeriod, securityDeposit, sellPrice } = req.body;

  try {
      // Set rental terms
      await rentalTermsContract.setRentalTerms(
          tokenId,
          adjustedHourlyPrice,
          adjustedDailyPrice,
          closedPeriod,
          refundabilityPeriod,
          securityDeposit
      );

      // Create the listed token for sale
      await marketContract.createListedToken(tokenId, sellPrice);

      // Send a success response
      res.status(200).send({ success: true, message: 'Rental terms and sale listing created successfully.' });
  } catch (error) {
      // Handle errors and send a failure response
      console.error(error);
      res.status(500).send({ success: false, error: error.message });
  }
};
