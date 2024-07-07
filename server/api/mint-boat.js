const { ethers } = require('hardhat');
const { expect } = require('chai');
const { deployContract } = require('./utils/setup');
const axios = require('axios'); 
const { uploadImageToIpfs, uploadMetaDatatoIpfs } = require('./utils/ipfs'); 

module.exports = async (req, res) => {
    const { boat_uuid, account_address, boatDetails, imageFile, client, price } = req.body;  
    
    if (!boat_uuid || !account_address || !boatDetails || !client || price === undefined) {
        return res.status(400).send({ success: false, message: 'Missing required fields' });
    }

   
    const listingType = boatDetails.listingType;
    const refundabilityPeriod = parseInt(boatDetails.refundPeriod, 10) * 3600;  
    const closedPeriod = parseInt(boatDetails.closedPeriod, 10) * 3600;  
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
     
        if (imageFile) {
            const uploadedImageUrl = await uploadImageToIpfs(imageFile);
            if (uploadedImageUrl) {
                boatDetails.nftImage = uploadedImageUrl;
                const metadataURL = await uploadMetaDatatoIpfs(boatDetails);
                if (metadataURL) {
                    const requestBody = {
                        chainId: client.chainId,
                        account: client.account,
                        metadataURL,  
                        uuid: boat_uuid
                    };
                    const response = await axios.post('http://localhost:3001/api/v1/token', requestBody);

                    
                    return res.status(200).send({ success: true, data: response.data });
                }
            }
        }

 
        res.status(400).send({ success: false, message: 'Image upload failed or no image provided' });
    } catch (error) {
 
        res.status(500).send({ success: false, error: error.message });
    }
};
