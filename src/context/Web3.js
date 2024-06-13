import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BoatAddress from '../contractsData/Ahoy-address.json';
import BoatAbi from '../contractsData/Ahoy.json';
import RentalAddress from '../contractsData/AhoyRental-address.json';
import RentalAbi from '../contractsData/AhoyRental.json';
import EscrowAddress from '../contractsData/Escrow-address.json';
import EscrowAbi from '../contractsData/Escrow.json';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [client, setClient] = useState(null)
  const [hasWeb3, setHasWeb3] = useState(false);
  const [boatsContract, setBoatsContract] = useState(null);
  const [rentalContract, setRentalContract] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);
  const [loading, setLoading] = useState(false);


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

  

  return (
    <Web3Context.Provider value={{ client, hasWeb3, web3Handler, boatsContract, rentalContract, escrowContract, loading}}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
