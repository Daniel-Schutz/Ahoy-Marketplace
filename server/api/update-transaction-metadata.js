const { UUID } = require('uuid');
const sharetribeSdk = require('sharetribe-flex-integration-sdk');
const { serialize, handleError } = require('../api-util/sdk');
const { ethers } = require('hardhat');

// Assuming you have a deployed instance of your AhoyRentals contract
const AhoyRentals = require('path_to_AhoyRentals_contract_instance'); 

const integrationSdk = sharetribeSdk.createInstance({
  clientId: process.env.INTEGRATION_API_ID,
  clientSecret: process.env.INTEGRATION_API_SECRET, 
});

module.exports = async (req, res) => {
  const { transactionId, rentalId } = req.body;

  try {
    const showTransactionResponse = await integrationSdk.transactions.show({ id: transactionId });
    const transaction = showTransactionResponse.data.data;
    let newBookingStatus = "";

    if (Object.keys(transaction.attributes.metadata).length === 0 && transaction.attributes.metadata.constructor === Object) {
      newBookingStatus = "Check In Completed";
      
      // Call checkIn function from AhoyRentals contract
      await AhoyRentals.checkIn(rentalId);
    } else {
      newBookingStatus = "Check Out Completed";

      // Call checkOut function from AhoyRentals contract
      await AhoyRentals.checkOut(rentalId);
    }

    const apiResponse = await integrationSdk.transactions.updateMetadata({
      id: transactionId,
      metadata: {
        bookingStatus: newBookingStatus
      }
    }, {
      expand: true
    });

    const { status, statusText, data } = apiResponse;
    res
      .status(status)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status,
          statusText,
          data,
        })
      )
      .end();
  } catch (e) {
    handleError(res, e);
  }
};
