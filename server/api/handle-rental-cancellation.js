const { ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { deployContract } = require('./utils/setup');

module.exports = async (req, res) => {
    const { boat_uuid, account_address, boatDetails, client, price, usdcAddress, ahoyTokenizedBoatsAddress, rentalTermsManagerAddress, ahoyRentalsAddress } = req.body;

    try {
        // Fetch contract instances
        const usdc = await ethers.getContractAt("ERC20", usdcAddress);
        const ahoyTokenizedBoats = await ethers.getContractAt("AhoyTokenizedBoats", ahoyTokenizedBoatsAddress);
        const rentalTermsManager = await ethers.getContractAt("RentalTermsManager", rentalTermsManagerAddress);
        const ahoyRentals = await ethers.getContractAt("AhoyRentals", ahoyRentalsAddress);

        const deployer = client.deployer;
        const accounts = await ethers.getSigners();

        // Fetch boat token ID from UUID
        const tokenId = await ahoyTokenizedBoats.fromUuid(boat_uuid);
        expect(tokenId).to.not.equal(0);

        // Get the rental terms
        const terms = await rentalTermsManager.terms(tokenId);

        // Calculate the rental period in hours
        const checkInDeadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const checkOutDeadline = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
        const rentalPeriodInHours = (checkOutDeadline - checkInDeadline) / 3600; // Calculate hours

        // Calculate the deposit amount
        const rentalFee = terms.hourlyRate * BigInt(rentalPeriodInHours);
        const depositAmount = rentalFee + terms.securityDeposit;

        const uuid = 'rental-agreement-uuid';

        // Get initial renter balance
        const initialRenterBalance = await usdc.balanceOf(account_address);
        console.log(`Renter Balance Before Reservation: ${ethers.utils.formatUnits(initialRenterBalance, 'ether')}`);

        // Approve USDC transfer for the deposit amount
        await usdc.connect(accounts[1]).approve(ahoyRentals.address, depositAmount);

        // Create the rental agreement
        await ahoyRentals
            .connect(deployer)
            .createRentalAgreement(
                tokenId,
                account_address,
                depositAmount,
                terms.securityDeposit,
                checkInDeadline,
                checkOutDeadline,
                uuid
            );

        // Verify the rental agreement details
        const rentalId = await ahoyRentals.fromUuid(uuid);

        // Verify renter's USDC balance has decreased by the deposit amount
        const finalRenterBalance = await usdc.balanceOf(account_address);
        console.log(`Renter Balance after making reservation: ${ethers.utils.formatUnits(finalRenterBalance, 'ether')}`);
        const expectedRenterBalance = initialRenterBalance - depositAmount;
        expect(finalRenterBalance).to.equal(expectedRenterBalance);

        // Request reservation cancellation
        await ahoyRentals.connect(deployer).requestCancelReservation(rentalId);

        // Cancel the reservation
        await ahoyRentals.connect(deployer).cancelReservation(rentalId);

        // Verify the reservation is canceled
        const isCanceled = await ahoyRentals.reservationCanceled(rentalId);
        expect(isCanceled).to.equal(true);

        // Verify the renter's balance after cancellation
        const renterBalanceAfterCancellation = await usdc.balanceOf(account_address);
        console.log(`Renter Balance after making cancellation: ${ethers.utils.formatUnits(renterBalanceAfterCancellation, 'ether')}`);
        expect(renterBalanceAfterCancellation).to.equal(initialRenterBalance);

        // Verify the contract balance after cancellation
        const contractBalanceAfterCancellation = await usdc.balanceOf(ahoyRentals.address);
        expect(contractBalanceAfterCancellation).to.equal(0);

        res.status(200).send({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, error: error.message });
    }
};
