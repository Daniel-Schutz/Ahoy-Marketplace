const { UUID } = require('uuid');
const sharetribeSdk = require('sharetribe-flex-integration-sdk');
const { serialize, handleError } = require('../api-util/sdk');

const integrationSdk = sharetribeSdk.createInstance({
  clientId: process.env.INTEGRATION_API_ID,
  clientSecret: process.env.INTEGRATION_API_SECRE, 
});

module.exports = (req, res) => {
  const { transactionId } = req.body;

  
  integrationSdk.transactions.show({ id: transactionId })
    .then(showTransactionResponse => {
      const transaction = showTransactionResponse.data.data;
      let newBookingStatus = ""
      if (Object.keys(transaction.attributes.metadata).length === 0 && transaction.attributes.metadata.constructor === Object){
         newBookingStatus = "Check In Completed"
      }
      else{
        newBookingStatus = "Check Out Completed"
      }

      
      return integrationSdk.transactions.updateMetadata({
        id: transactionId,
        metadata: {
          bookingStatus: newBookingStatus
        }
      }, {
        expand: true
      });
    })
    .then(apiResponse => {
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
    })
    .catch(e => {
      handleError(res, e);
    });
};

//this is the call for when the renter is about to use the boat
// function checkIn(
//   uint rentalId
// )
//   public
//   validRentalAgreement(rentalId)
//   onlyBoatOrContractOwner(_rentalAgreements[rentalId].boatId)
// {
//   checkInTime[rentalId] = block.timestamp;
//   emit RenterCheckedIn(rentalId);
// }

// // this is the call for when they return the boat after using it
// function checkOut(
//   uint rentalId
// )
//   public
//   validRentalAgreement(rentalId)
//   onlyBoatOrContractOwner(_rentalAgreements[rentalId].boatId)
// {
//   checkOutTime[rentalId] = block.timestamp;
//   emit RenterCheckedOut(rentalId);
// }