const { UUID } = require('uuid');
const sharetribeSdk = require('sharetribe-flex-sdk');
const integrationSdk = sharetribeSdk.createInstance({
  clientId: process.env.REACT_APP_INTEGRATION_API_ID,
  clientSecret: process.env.REACT_APP_INTEGRATION_API_SECRE
});

module.exports = (req, res) => {
  const { transactionId, bookingStatus } = req.b0ody;

  // Cria um objeto para os novos metadados
  const metadata = {
    bookingStatus: bookingStatus
  };
  
  
  integrationSdk.transactions.updateMetadata(
    {
      id: new UUID(transactionId),
      metadata: metadata 
    },
    {
      expand: true 
    }
  )
  .then(apiResponse => {
    const { status, statusText, data } = apiResponse;

    res
      .status(status)
      .set('Content-Type', 'application/json')
      .send({
        status,
        statusText,
        data,
      })
      .end();
  })
  .catch(e => {
    console.error(e);
    if (e.response) {
      console.error('Response data:', e.response.data);
      console.error('Response status:', e.response.status);
      console.error('Response headers:', e.response.headers);
    }
    res
      .status(500)
      .send({
        error: 'An error occurred while updating the transaction metadata.'
      })
      .end();
  });
};
