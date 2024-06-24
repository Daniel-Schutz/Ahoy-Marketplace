const { UUID } = require('uuid');
const sharetribeSdk = require('sharetribe-flex-sdk');
const { serialize, handleError, getSdk, getTrustedSdk } = require('../api-util/sdk');

const integrationSdk = sharetribeSdk.createInstance({
  clientId: process.env.REACT_APP_INTEGRATION_API_ID,
  clientSecret: process.env.REACT_APP_INTEGRATION_API_SECRET,
});

module.exports = (req, res) => {
  const { transactionId } = req.body;

  const sdk = getSdk(req, res);

  const transactionPromise = () => sdk.transactions.show({ id: transactionId });

  Promise.all([transactionPromise()])
    .then(([showTransactionResponse]) => {
      const transaction = showTransactionResponse.data.data;
      
      return getTrustedSdk(req);
    })
    .then(trustedSdk => {
      // const metadata = {
      //   bookingStatus:bookingStatus
      // };

      return trustedSdk.transactions.show({
        id: transactionId
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
