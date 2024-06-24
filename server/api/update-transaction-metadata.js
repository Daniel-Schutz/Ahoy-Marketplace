const { UUID } = require('uuid');
const sharetribeSdk = require('sharetribe-flex-sdk');
const { serialize, handleError } = require('../api-util/sdk');

const integrationSdk = sharetribeSdk.createInstance({
  clientId: process.env.REACT_APP_INTEGRATION_API_ID,
  clientSecret: process.env.REACT_APP_INTEGRATION_API_SECRET,  // Corrigido de SECRE para SECRET
});

module.exports = (req, res) => {
  const { transactionId } = req.body;

  // Primeiro, obtemos a transação atual
  integrationSdk.transactions.show({ id: transactionId })
    .then(showTransactionResponse => {
      const transaction = showTransactionResponse.data.data;

      // Em seguida, atualizamos os metadados da transação
      return integrationSdk.transactions.updateMetadata({
        id: new UUID(transactionId),
        metadata: {
          extId: 1234,
          promotionDiscount: 20
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
