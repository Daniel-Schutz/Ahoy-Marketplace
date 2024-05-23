const { expect } = require("chai");
const { BigNumber } = require("ethers");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("Ahoy", function () {
    let ahoy, owner, addr1, addr2;
    let URI = "SampleURI";
    let hourlyPrice = toWei(1);
    let dailyPrice = toWei(5);
    let currentlyListed = true;
    let refundabilityPeriod = 1; 
    let deposit = toWei(10);
    let closedPeriod = 30; 
    let sellPrice = toWei(100);

    beforeEach(async function () {
        const Ahoy = await ethers.getContractFactory("Ahoy");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        console.log('contract owner:', owner.address); // contract owner
        console.log('address 1 owner:', addr1.address);
        console.log('address 2 owner:', addr2.address);

        ahoy = await Ahoy.deploy();
        await ahoy.deployed();
    });

    // describe("Minting NFTs", function () {
    //     it("Should track newly minted NFT", async function () {
    //         await ahoy.connect(addr1).mint(
    //             URI,
    //             hourlyPrice,
    //             dailyPrice,
    //             currentlyListed,
    //             refundabilityPeriod,
    //             deposit,
    //             closedPeriod,
    //             sellPrice
    //         );
    //         const nft1 = await ahoy.boats(1);
    //         expect(nft1.boatId).to.equal(1);
    //         expect(nft1.owner).to.equal(addr1.address);
    //         expect(nft1.hourlyPrice).to.equal(hourlyPrice);
    //         expect(nft1.dailyPrice).to.equal(dailyPrice);

    //         await ahoy.connect(addr2).mint(
    //             URI,
    //             hourlyPrice,
    //             dailyPrice,
    //             currentlyListed,
    //             refundabilityPeriod,
    //             deposit,
    //             closedPeriod,
    //             sellPrice
    //         );
    //         const nft2 = await ahoy.boats(2);
    //         expect(nft2.boatId).to.equal(2);
    //         expect(nft2.owner).to.equal(addr2.address);
    //         expect(nft2.hourlyPrice).to.equal(hourlyPrice);
    //         expect(nft2.dailyPrice).to.equal(dailyPrice);
    //     });
    // });

    // describe("Updating Token URI", function () {
    //     let newURI = "NewSampleURI";

    //     beforeEach(async function () {
    //         await ahoy.connect(addr1).mint(
    //             URI,
    //             hourlyPrice,
    //             dailyPrice,
    //             currentlyListed,
    //             refundabilityPeriod,
    //             deposit,
    //             closedPeriod,
    //             sellPrice
    //         );
    //     });

    //     //testing to make sure only contract owner or nft owner can do the update
    //     it("Should allow contract owner to update token URI", async function () {
    //         await ahoy.updateTokenURI(1, newURI);
    //         const tokenURI = await ahoy.tokenURI(1);
    //         expect(tokenURI).to.equal(newURI);
    //     });

    //     it("Should allow NFT owner to update token URI", async function () {
    //         await ahoy.connect(addr1).updateTokenURI(1, newURI);
    //         const tokenURI = await ahoy.tokenURI(1);
    //         expect(tokenURI).to.equal(newURI);
    //     });

    //     //this fucntion should cause a fail
    //     // it("Should not allow NFT owner to update token URI", async function () {
    //     //     await ahoy.connect(addr2).updateTokenURI(1, newURI);
    //     //     const tokenURI = await ahoy.tokenURI(1);
    //     //     expect(tokenURI).to.equal(newURI);
    //     // });

    //     //commenting out the above one, this one will pass
    //     it("Should not allow non-owner to update token URI", async function () {
    //         await expect(ahoy.connect(addr2).updateTokenURI(1, newURI)).to.be.revertedWith("Only nft owner or contract owner can update URI");
    //     });
    // });

    describe("Execute Sale", function () {
        beforeEach(async function () {
            await ahoy.connect(addr1).mint(
                URI,
                hourlyPrice,
                dailyPrice,
                currentlyListed,
                refundabilityPeriod,
                deposit,
                closedPeriod,
                sellPrice
            );
            await ahoy.connect(addr2).mint(
                URI,
                hourlyPrice,
                dailyPrice,
                currentlyListed,
                refundabilityPeriod,
                deposit,
                closedPeriod,
                sellPrice
            );
        });
    
        it("Should allow a user to purchase an NFT", async function () {
            const boatId = 1;

            // Check initial ownership and to test getMyNFTs function
            let addr1NFTs = await ahoy.connect(addr1).getMyNFTs();
            let addr2NFTs = await ahoy.connect(addr2).getMyNFTs();
            expect(addr1NFTs.length).to.equal(1);
            expect(addr2NFTs.length).to.equal(1);


            //making sure balance in the end has updated
            const sellerBalanceBefore = await ethers.provider.getBalance(addr1.address);

            // Execute sale from addr2
            await ahoy.connect(addr2).executeSale(boatId, { value: sellPrice });

            const sellerBalanceAfter = await ethers.provider.getBalance(addr1.address);
            const newOwner = await ahoy.ownerOf(boatId);
            const nft = await ahoy.boats(boatId);

            //make sure arrays have updated
            addr1NFTs = await ahoy.connect(addr1).getMyNFTs();
            addr2NFTs = await ahoy.connect(addr2).getMyNFTs();
            expect(addr1NFTs.length).to.equal(0);
            expect(addr2NFTs.length).to.equal(2);

            //checks parameters to make sure sale executed fine
            expect(newOwner).to.equal(addr2.address);
            expect(nft.owner).to.equal(addr2.address);
            expect(nft.currentlyListed).to.equal(false);
            expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(sellPrice);
        });
    });
    

});
