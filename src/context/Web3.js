import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BoatAddress from '../contractsData/Ahoy-address.json';
import BoatAbi from '../contractsData/Ahoy.json';
import RentalAddress from '../contractsData/AhoyRental-address.json';
import RentalAbi from '../contractsData/AhoyRental.json';
import EscrowAddress from '../contractsData/Escrow-address.json';
import EscrowAbi from '../contractsData/Escrow.json';
import _ from 'lodash';
import { uploadImagetoIPFS, uploadJSONtoIPFS } from '../util/pinata';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [client, setClient] = useState(null)
  const [hasWeb3, setHasWeb3] = useState(false);
  const [boatsContract, setBoatsContract] = useState(null);
  const [rentalContract, setRentalContract] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentlyListed, setCurrentlyListed] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [nftImage, setNftImage] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      setHasWeb3(true);
    }
  }, []);

  const web3Handler = async () => {
    if (!window.ethereum) return;

    try {
      setLoading(true);

      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      //wallet and privder combined give you signer
      //wallet gives us signer object
      const signer = provider.getSigner();

      setClient({
        account,
        signer,
        chainId: parseInt(chainId, 16),
        provider,
      });

      loadContracts(signer);

      setLoading(false);
    } catch (error) {
      console.error("Error connecting to web3:", error);
      setLoading(false);
    }
  };

  const loadContracts = (signer) => {
    const boatsContract = new ethers.Contract(BoatAddress.address, BoatAbi.abi, signer);
    const rentalContract = new ethers.Contract(RentalAddress.address, RentalAbi.abi, signer);
    const escrowContract = new ethers.Contract(EscrowAddress.address, EscrowAbi.abi, signer);
    console.log({rentalContract})

    setBoatsContract(boatsContract);
    setRentalContract(rentalContract);
    setEscrowContract(escrowContract);
  };

  const uploadImageToIpfs = async (image) => {
    try {
      const response = await uploadImagetoIPFS(image);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("Error during file upload", e);
      throw e; // Re-throw the error to handle it in createBoatNft
    }
  };

  const uploadMetaDatatoIpfs = async (boatDetails) => {
    try {
      const response = await uploadJSONtoIPFS(boatDetails);
      if(response.success === true){
        console.log("Uploaded JSON to Pinata: ", response.pinataURL)
        return response.pinataURL;
      }
    } catch(e) {
      console.log("Error during metadata upload", e);
    }
  }


  const createBoatNft = async ({ boatDetails, price }) => {
    try {
      if (imageFile) {
        const uploadedImageUrl = await uploadImageToIpfs(imageFile);
        if (uploadedImageUrl) {
          boatDetails.nftImage = uploadedImageUrl; 
          const metadataURL = await uploadMetaDatatoIpfs(boatDetails);
          if(metadataURL) {
            const parsedPrice = parseInt(price)
            const transaction = await boatsContract.mint(metadataURL, parsedPrice, 0, true, 0, 0, 0, 0)
            await transaction.wait()
            if (transaction) {
              console.log("NFT minted successfully:", transaction);
            }
        }
        }
      }
    } catch (error) {
      console.error("Error creating boat NFT:", error);
    }
  };

  return (
    <Web3Context.Provider value={{ client, hasWeb3, web3Handler, boatsContract, rentalContract, escrowContract, loading, setImageFile, createBoatNft}}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
