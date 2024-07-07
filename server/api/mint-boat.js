const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployContract } = require('./utils/setup');

module.exports = (req, res) => {
    const { boat_uuid, account_address} = req.body;
    
    // this is everything required for minting a boat which happens before it becomes for sale or for rent 
    const listingType = boatDetails.listingType;
    const refundabilityPeriod = parseInt(boatDetails.refundPeriod, 10) * 3600; // Convert hours to seconds
    const closedPeriod = parseInt(boatDetails.closedPeriod, 10) * 3600; // Convert hours to seconds
    const wholeDollarPrice = Math.floor(price / 100);
  
    let sellPrice = 0, dailyPrice = 0, hourlyPrice = 0, deposit = 0;
  
    if (listingType === "sale") {
      sellPrice = wholeDollarPrice;
    } else if (listingType === "hourly-rental") {
      hourlyPrice = wholeDollarPrice;
      deposit = Math.floor(boatDetails.deposit.amount / 100);
    } else if (listingType === "daily-rental") {
      dailyPrice = wholeDollarPrice;
      deposit = Math.floor(boatDetails.deposit.amount / 100);
    }
  
    try {
      // Check if imageFile is available and upload it to IPFS
      if (imageFile) {
        const uploadedImageUrl = await uploadImageToIpfs(imageFile);
        if (uploadedImageUrl) {
          boatDetails.nftImage = uploadedImageUrl;
          const metadataURL = await uploadMetaDatatoIpfs(boatDetails);
          if (metadataURL) {
            const requestBody = {
              chainId: client.chainId,
              account: client.account,
              metadataURL, // Include metadata URL in the request body
              uuid
            };
            const response = await axios.post('http://localhost:3001/api/v1/token', requestBody);
 
  };