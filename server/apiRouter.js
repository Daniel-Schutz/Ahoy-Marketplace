// router.js

const express = require('express');
const bodyParser = require('body-parser');
const { deserialize } = require('./api-util/sdk');

const initiateLoginAs = require('./api/initiate-login-as');
const loginAs = require('./api/login-as');
const transactionLineItems = require('./api/transaction-line-items');
const initiatePrivileged = require('./api/initiate-privileged');
const transitionPrivileged = require('./api/transition-privileged');
const updateTransactionMetadata = require('./api/update-transaction-metadata');
const bitpayInitiatePrivileged = require('./api/bitpay-initiate-privileged');
const createUserWithIdp = require('./api/auth/createUserWithIdp');
const createBoatNft = require('./api/create-boat-nft');
const { authenticateFacebook, authenticateFacebookCallback } = require('./api/auth/facebook');
const { authenticateGoogle, authenticateGoogleCallback } = require('./api/auth/google');
const boatSale = require('./api/boat-sale');
const mintBoat = require('./api/mint-boat');
const router = express.Router();
const getAhoyNFT = require('./get-ahoy-nft');
const handleRentalCompletion = require('./handle-rental-completion');
const handleRentalCancellation = require('./handle-rental-cancellation');

// ================ API router middleware: ================ //

// Parse Transit body first to a string
router.use(
  bodyParser.text({
    type: 'application/transit+json',
  })
);

// Deserialize Transit body string to JS data
router.use((req, res, next) => {
  if (req.get('Content-Type') === 'application/transit+json' && typeof req.body === 'string') {
    try {
      req.body = deserialize(req.body);
    } catch (e) {
      console.error('Failed to parse request body as Transit:');
      console.error(e);
      res.status(400).send('Invalid Transit in request body.');
      return;
    }
  }
  next();
});

// ================ API router endpoints: ================ //

router.get('/initiate-login-as', initiateLoginAs);
router.get('/login-as', loginAs);
router.post('/transaction-line-items', transactionLineItems);
router.post('/initiate-privileged', initiatePrivileged);
router.post('/bitpay-initiate-privileged', bitpayInitiatePrivileged);
router.post('/transition-privileged', transitionPrivileged);
router.post('/update_metadata', updateTransactionMetadata);
router.post('/create-boat-nft', createBoatNft);
router.post('/boat-sale', boatSale);
router.post('/mint-boat', mintBoat);
router.post('/get-ahoy-nft', getAhoyNFT);

router.post('/handle-rental-completion', handleRentalCompletion);
router.post('/handle-rental-cancellation', handleRentalCancellation);

 
// Create user with identity provider (e.g. Facebook or Google)
// This endpoint is called to create a new user after user has confirmed
// they want to continue with the data fetched from IdP (e.g. name and email)
router.post('/auth/create-user-with-idp', createUserWithIdp);

// Facebook authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Facebook
router.get('/auth/facebook', authenticateFacebook);

// This is the route for callback URL the user is redirected after authenticating
// with Facebook. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Sharetribe Auth API to authenticate user to the marketplace
router.get('/auth/facebook/callback', authenticateFacebookCallback);

// Google authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Google
router.get('/auth/google', authenticateGoogle);

// This is the route for callback URL the user is redirected after authenticating
// with Google. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Sharetribe Auth API to authenticate user to the marketplace
router.get('/auth/google/callback', authenticateGoogleCallback);

module.exports = router;
