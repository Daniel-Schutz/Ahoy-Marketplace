async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  
  // Get the ContractFactories and Signers here.
  // const NFT = await ethers.getContractFactory("NFT");
  // const Marketplace = await ethers.getContractFactory("Marketplace");
  const Ahoy = await ethers.getContractFactory("Ahoy");
  const AhoyTransactions = await ethers.getContractFactory("AhoyRental");
  // deploy contracts
  // const nft = await NFT.deploy();
  // const marketplace = await Marketplace.deploy();
  const ahoy = await Ahoy.deploy();
  const ahoyRentals = await AhoyTransactions.deploy();

  // console.log("NFT contract address", nft.address)
  // console.log("Marketplace contract address", marketplace.address)
  console.log("Ahoy contract address", ahoy.address)
  console.log("AhoyRentals contract address", ahoyRentals.address)

  // Save copies of each contracts abi and address to the frontend.
  // saveFrontendFiles(nft , "NFT");
  // saveFrontendFiles(marketplace , "Marketplace");
  saveFrontendFiles(ahoy , "Ahoy");
  saveFrontendFiles(ahoyRentals , "AhoyRental");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });