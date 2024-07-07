import express from 'express';
import { retrieve, getInterface } from '../utils/evm/contract.js'; 


function getAhoyNFT(chainId) {
  return retrieve(
    'AhoyTokenizedBoats',
    chainId,
    evm.network.signer(chainId)
  );
}

module.exports = (req, res) => {
  const { chainId, account, metadataURL, uuid } = req.body;
   try {

    console.log({account})
    console.log({chainId})
    console.log({uuid})
    console.log({metadataURL})

    // This is the process for minting and setting uri for ahoy boat token
    // const ahoyNFTContract = await getAhoyNFT(chainId);
    // await (await ahoyNFTContract.mintTo(account, uuid)).wait();
    // const tokenId = await ahoyNFTContract.fromUuid(uuid);
		// const setTokenUriTx = await ahoyNFTContract.setTokenURI(tokenId, metadataURL);
		// await setTokenUriTx.wait();

    // console.log('ahoyNFTContract contract instance:', ahoyNFTContract); // Log the contract instance

    res.send(`AhoyTokenizedBoats contract instance retrieved successfully for chainId: ${chainId}`);
  } catch (error) {
    res.status(500).send('Error retrieving AhoyTokenizedBoats contract instance');
  }
  };