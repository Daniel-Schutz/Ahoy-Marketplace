// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

contract AhoyRental is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _rentalIds;
    address owner;

    struct Rental {
        uint256 rentalId;
        uint256 boatId;
        address payable boatOwner;
        address payable renter;
        bool checkedIn;
        bool checkedOut;
        uint256 rentalFee;
        uint256 deposit;
        bool refundGranted;
        uint256 lateCheckOutHours;
        bool inspection;
        uint256 totalValue; // Total value of the rental (rental fee + deposit)
    }

    event RentalListedSuccess(
        uint256 indexed rentalId,
        uint256 boatId,
        address payable boatOwner,
        address payable renter,
        // uint256 rentalDays,
        bool checkedIn,
        bool checkedOut,
        uint256 rentalFee,
        uint256 deposit,
        bool refundGranted,
        // bool depositReleased,
        uint256 lateCheckOutHours,
        bool inspection,
        uint256 totalValue
    );

    modifier onlyRenterOrOwner(uint256 rentalId) {
        require(
            msg.sender == rentals[rentalId].renter || msg.sender == owner,
            "Only renter or contract owner can perform this action"
        );
        _;
    }

    modifier onlyBoatListerOrOwner(uint256 rentalId) {
        require(
            msg.sender == rentals[rentalId].boatOwner || msg.sender == owner,
            "Only boat owner or contract owner can perform this action"
        );
        _;
    }

    event RentalCheckedIn(uint256 indexed rentalId, address renter);

    event RentalCheckedOut(uint256 indexed rentalId, address boatOwner);

    event RentalInspection(uint256 indexed rentalId, address boatOwner);

    event RefundRequested(uint256 indexed rentalId, address renter);

    mapping(uint256 => Rental) public rentals;

    constructor() ERC721("Rental NFT", "RENTAL") {
        owner = msg.sender;
    }

    function mint(
        string memory rentalURI,
        uint256 boatId,
        address payable boatOwner,
        // uint256 rentalDays,
        uint256 rentalFee,
        uint256 deposit
    ) public payable returns (uint) {
        require(rentalFee > 0, "Price must be greater than zero");
        require(msg.value == rentalFee + deposit, "Incorrect value sent");
        _rentalIds.increment();
        uint256 newRentalId = _rentalIds.current();
        _safeMint(msg.sender, newRentalId);
        _setTokenURI(newRentalId, rentalURI);
        createListedRentalToken(
            newRentalId,
            boatId,
            boatOwner,
            // rentalDays,
            rentalFee,
            deposit,
            msg.value
        );
        return newRentalId;
    }

    function createListedRentalToken(
        uint256 rentalId,
        uint256 boatId,
        address payable boatOwner,
        // uint256 rentalDays,
        uint256 rentalFee,
        uint256 deposit,
        uint256 total
    ) private {
        uint256 totalValue = total;

        rentals[rentalId] = Rental(
            rentalId,
            boatId,
            boatOwner,
            payable(msg.sender),
            // rentalDays,
            false,
            false,
            rentalFee,
            deposit,
            false,
            // false,
            0,
            false,
            totalValue
        );

        emit RentalListedSuccess(
            rentalId,
            boatId,
            boatOwner,
            payable(msg.sender),
            // rentalDays,
            false,
            false,
            rentalFee,
            deposit,
            false,
            // false,
            0,
            false,
            totalValue
        );
    }

    //Returns all the NFTs that the current user is boatowner or renter in
    function getMyRentals() public view returns (Rental[] memory) {
        uint totalRentalCount = _rentalIds.current();
        uint rentalCount = 0;

        // Count the number of rentals associated with the caller
        for (uint i = 1; i <= totalRentalCount; i++) {
            if (
                rentals[i].boatOwner == msg.sender ||
                rentals[i].renter == msg.sender
            ) {
                rentalCount++;
            }
        }

        // Initialize a dynamic array to store the rentals
        Rental[] memory items = new Rental[](rentalCount);
        uint currentIndex = 0;

        // Populate the array with rentals associated with the caller
        for (uint i = 1; i <= totalRentalCount; i++) {
            if (
                rentals[i].boatOwner == msg.sender ||
                rentals[i].renter == msg.sender
            ) {
                items[currentIndex] = rentals[i];
                currentIndex++;
            }
        }

        return items;
    }

    function checkIn(
        uint256 rentalId,
        uint256 currentTime,
        uint256 checkInTime
    ) public onlyRenterOrOwner(rentalId) returns (bool) {
        // Ensure that the rental ID is valid
        require(_exists(rentalId), "Rental ID does not exist");

        // Ensure that the rental hasn't already been checked in
        require(!rentals[rentalId].checkedIn, "Rental already checked in");

        // Ensure that the current time is at or after the check-in time
        require(currentTime >= checkInTime, "Check-in time not reached");

        // Update the rental's checkedIn status to true
        rentals[rentalId].checkedIn = true;

        // Emit an event to indicate successful check-in
        emit RentalCheckedIn(rentalId, msg.sender);

        return true;
    }

    function checkOut(
        uint256 rentalId,
        uint256 lateTime
    ) public returns (bool) {
        // Ensure that the rental ID is valid
        require(_exists(rentalId), "Rental ID does not exist");

        // Ensure that the caller is the boat owner
        require(
            msg.sender == rentals[rentalId].boatOwner,
            "Only boat owner can check out"
        );

        // Ensure that the rental hasn't already been checked out
        require(!rentals[rentalId].checkedOut, "Rental already checked out");

        // Update the rental's checkedOut status to true
        rentals[rentalId].checkedOut = true;

        //update amount of time late
        rentals[rentalId].lateCheckOutHours = lateTime;

        // Emit an event to indicate successful check-out
        emit RentalCheckedOut(rentalId, msg.sender);

        return true;
    }

    function checkInspection(
        uint256 rentalId,
        bool inspectionStatus
    ) public onlyBoatListerOrOwner(rentalId) returns (bool) {
        // Ensure that the rental ID is valid
        require(_exists(rentalId), "Rental ID does not exist");

        // Update the rental's inspection status to true
        rentals[rentalId].inspection = inspectionStatus;

        // Emit an event to indicate successful check-out
        emit RentalInspection(rentalId, msg.sender);

        withdrawFunds(rentalId);

        return true;
    }

    // internal means function cant be called from outside the contract
    function withdrawFunds(uint256 rentalId) internal {
        // Ensure that the rental has been checked out
        require(
            rentals[rentalId].checkedOut,
            "Rental must be checked out before withdrawing deposit"
        );

        // Ensure that the deposit has not been refunded already
        require(
            rentals[rentalId].deposit > 0,
            "Deposit has already been released"
        );

        // Ensure that late check out time is zero
        require(
            rentals[rentalId].lateCheckOutHours == 0,
            "Late check out time must be zero before withdrawing deposit"
        );

        // Ensure that inspection equals true
        require(
            rentals[rentalId].inspection == true,
            "ensure inspection has passed"
        );

        // Transfer the deposit amount to the boat renter
        rentals[rentalId].renter.transfer(rentals[rentalId].deposit);

        // Make deposit value zero
        rentals[rentalId].deposit = 0;

        // Transfer the rentalfee amount to the boat owner
        rentals[rentalId].boatOwner.transfer(rentals[rentalId].rentalFee);

        // Make rental fee value zero
        rentals[rentalId].rentalFee = 0;

        // Make total value zero
        rentals[rentalId].totalValue = 0;
    }

    function getListedRentalForId(
        uint256 rentalId
    ) public view returns (Rental memory) {
        return rentals[rentalId];
    }

    // function getCheckInStatus(uint256 rentalId) public view returns (bool) {
    //     require(_exists(rentalId), "Rental ID does not exist");

    //     return rentals[rentalId].checkedIn;
    // }

    // function getCheckOutStatus(uint256 rentalId) public view returns (bool) {
    //     require(_exists(rentalId), "Rental ID does not exist");
    //     return rentals[rentalId].checkedOut;
    // }

    function requestRefund(
        uint256 rentalId
    ) public onlyRenterOrOwner(rentalId) returns (bool) {
        require(_exists(rentalId), "Rental ID does not exist");
        require(
            msg.sender == rentals[rentalId].renter,
            "Only renter can request a refund"
        );
        require(
            !rentals[rentalId].checkedIn,
            "Refund cannot be requested after check-in"
        );

        rentals[rentalId].refundGranted = true;

        emit RefundRequested(rentalId, msg.sender);

        return true;
    }

    function disputes(
        uint256 rentalId,
        uint256 renterTotal,
        uint256 boatOwnerTotal
    ) public payable {
        require(_exists(rentalId), "Rental ID does not exist");
        require(
            msg.sender == owner,
            "Only contract owner can perform this action"
        );

        // Ensure that the total value of the rental matches the sum of the disputed amounts
        require(
            rentals[rentalId].totalValue == renterTotal + boatOwnerTotal,
            "Invalid dispute amounts"
        );

        // Transfer funds to the renter if renterTotal is greater than 0
        if (renterTotal > 0) {
            require(
                renterTotal <= rentals[rentalId].totalValue,
                "Invalid renter total"
            );
            require(
                rentals[rentalId].renter.send(renterTotal),
                "Failed to transfer funds to renter"
            );
            rentals[rentalId].totalValue -= renterTotal;
        }

        // Transfer funds to the boat owner if boatOwnerTotal is greater than 0
        if (boatOwnerTotal > 0) {
            require(
                boatOwnerTotal <= rentals[rentalId].totalValue,
                "Invalid boat owner total"
            );
            require(
                rentals[rentalId].boatOwner.send(boatOwnerTotal),
                "Failed to transfer funds to boat owner"
            );
            rentals[rentalId].totalValue -= boatOwnerTotal;
        }
    }

    function getRefundStatus(uint256 rentalId) public view returns (bool) {
        require(_exists(rentalId), "Rental ID does not exist");
        return rentals[rentalId].refundGranted;
    }

    function getInspectionStatus(uint256 rentalId) public view returns (bool) {
        require(_exists(rentalId), "Rental ID does not exist");
        return rentals[rentalId].inspection;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function burn(uint256 rentalId) public onlyBoatListerOrOwner(rentalId) {
        // Ensure that the rental ID is valid
        require(_exists(rentalId), "Rental ID does not exist");

        // Ensure that the all funds have been dispersed has been checked out
        require(
            rentals[rentalId].totalValue == 0,
            "Rental must be checked out before burning"
        );

        // Burn the NFT
        _burn(rentalId);

        // Remove the burned NFT from the mapping
        delete rentals[rentalId];
    }
}
