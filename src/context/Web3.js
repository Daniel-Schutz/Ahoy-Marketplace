import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BoatAddress from '../contractsData/Ahoy-address.json';
import BoatAbi from '../contractsData/Ahoy.json';
import RentalAddress from '../contractsData/AhoyRental-address.json';
import RentalAbi from '../contractsData/AhoyRental.json';
import EscrowAddress from '../contractsData/Escrow-address.json';
import EscrowAbi from '../contractsData/Escrow.json';
import _ from 'lodash';
import { removeURLfromIPFS, uploadImagetoIPFS, uploadJSONtoIPFS } from '../util/pinata';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [client, setClient] = useState(null);
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
      throw e;
    }
  };

  const uploadMetaDatatoIpfs = async (boatDetails) => {
    try {
      const response = await uploadJSONtoIPFS(boatDetails);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response.pinataURL);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("Error during metadata upload", e);
    }
  };

  const createBoatNft = async ({ boatDetails, price, uuid }) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }
    const listingType = boatDetails.listingType;
    let hourlyPrice;
    let dailyPrice;
    let sellPrice;
    const refundabilityPeriod = 0;
    const deposit = 0;
    const closedPeriod = 0;

    try {
      if (imageFile) {
        const uploadedImageUrl = await uploadImageToIpfs(imageFile);
        if (uploadedImageUrl) {
          boatDetails.nftImage = uploadedImageUrl;
          const metadataURL = await uploadMetaDatatoIpfs(boatDetails);
          if (metadataURL) {
            if (listingType === "sale") {
              sellPrice = parseInt(price);
              dailyPrice = 0;
              hourlyPrice = 0;
            } else if (listingType === "hourly-rental") {
              sellPrice = 0;
              dailyPrice = 0;
              hourlyPrice = parseInt(price);
            } else {
              sellPrice = 0;
              dailyPrice = parseInt(price);
              hourlyPrice = 0;
            }
            const transaction = await boatsContract.mint(metadataURL, uuid, hourlyPrice, dailyPrice, true, refundabilityPeriod, deposit, closedPeriod, sellPrice);
            await transaction.wait();
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

  const updateBoatTokenURI = async (boatUUID, oldUri, boatDetails) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }

    try {
      const response = await removeURLfromIPFS(oldUri);
      if (response.success) {
        const newTokenURI = await uploadMetaDatatoIpfs(boatDetails);
        if (newTokenURI) {
          const transaction = await boatsContract.updateTokenURIByUUID(boatUUID, newTokenURI);
          await transaction.wait();
          if (transaction) {
            console.log("Token URI updated successfully:", transaction);
          }
        }
      }
    } catch (error) {
      console.error("Error updating token URI:", error);
    }
  };

  const updateBoatPrice = async ({ boatDetails, price, uuid }) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }

    const listingType = boatDetails.listingType;
    const newPrice = parseInt(price);

    if (newPrice > 0) {
      try {
        let transaction;
        if (listingType === "hourly-rental") {
          transaction = await boatsContract.updateHourlyPrice(uuid, newPrice);
        } else if (listingType === "daily-rental") {
          transaction = await boatsContract.updateDailyPrice(uuid, newPrice);
        } else if (listingType === "sale") {
          transaction = await boatsContract.updateSellPrice(uuid, newPrice);
        } else {
          console.error("Invalid listing type");
          return;
        }

        await transaction.wait();
        console.log("Price updated successfully:", transaction);
      } catch (error) {
        console.error("Error updating boat price:", error);
      }
    }
  };

  const updateBoatListingStatus = async ({ isListed, uuid }) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }
    try {
      const transaction = await boatsContract.updateStatus(uuid, isListed);
      await transaction.wait();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateBoatListingRefundability = async ({ newPeriod, uuid }) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }
    try {
      const transaction = await boatsContract.updateRefundabilityPeriod(uuid, newPeriod);
      await transaction.wait();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getNFTsInRange = async (lowerBound, upperBound) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }

    try {
      const tokens = await boatsContract.getNFTsInRange(lowerBound, upperBound);
      return tokens;
    } catch (error) {
      console.error("Error getting NFTs in range:", error);
      return [];
    }
  };

  const inventoryOf = async () => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }
    try {
      const tokens = await boatsContract.inventoryOf(client.account);
      return tokens;
    } catch (error) {
      console.error("Error getting user's NFTs:", error);
      return [];
    }
  };

  const getBoat = async ({ uuid }) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }

    try {
      const boat = await boatsContract.getListedBoatForId(uuid);
      return boat;
    } catch (error) {
      console.error("Error getting boat details:", error);
      return null;
    }
  };

  const executeSale = async (uuid, price) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }

    try {
      const transaction = await boatsContract.executeSale(uuid, { value: ethers.utils.parseEther(price) });
      await transaction.wait();
      console.log("Sale executed successfully:", transaction);
    } catch (error) {
      console.error("Error executing sale:", error);
    }
  };

  const relistBoat = async (uuid) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }

    try {
      const transaction = await boatsContract.relistBoat(uuid);
      await transaction.wait();
      console.log("Boat relisted successfully:", transaction);
    } catch (error) {
      console.error("Error relisting boat:", error);
    }
  };

  const createRentalNft = async ({ rentalDetails, uuid, boatOwner, deposit }) => {
    if (!client) {
      console.error("Client is not initialized.");
      return;
    }
    const metadataURL = await uploadMetaDatatoIpfs(rentalDetails);
    try {
      if (metadataURL) {
        const transaction = await rentalContract.mint(metadataURL, uuid, boatOwner, deposit);
        await transaction.wait();
        if (transaction) {
          console.log("NFT minted successfully:", transaction);
        }
      }
    } catch (error) {
      console.error("Error creating boat NFT:", error);
    }
  };

  return (
    <Web3Context.Provider value={{ client, hasWeb3, web3Handler, boatsContract, rentalContract, escrowContract, loading, setImageFile, createBoatNft, updateBoatTokenURI, updateBoatPrice, updateBoatListingStatus, updateBoatListingRefundability, getNFTsInRange, inventoryOf, getBoat, executeSale, relistBoat, createRentalNft }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
