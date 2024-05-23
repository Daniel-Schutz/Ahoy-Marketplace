// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Ahoy is ERC721URIStorage {
    using Counters for Counters.Counter;
    //_boatIds variable has the most recent minted boatId
    Counters.Counter private _boatIds;
    //this owner is the contract address that created the smart contract
    address payable owner;

    struct Boat {
        uint256 boatId;
        address payable owner; //this owner is the one who owns the boat being listed
        uint256 hourlyPrice;
        uint256 dailyPrice;
        bool currentlyListed;
        uint256 refundabilityPeriod;
        uint256 deposit;
        uint256 closedPeriod;
        uint256 sellPrice;
    }

    // Events are used to log important occurrences on the blockchain,
    // allowing external applications to efficiently track and react to them.
    // 'indexed' parameter for efficient event filtering
    event BoatListedSuccess(
        uint256 indexed boatId,
        address owner,
        uint256 hourlyPrice,
        uint256 dailyPrice,
        bool currentlyListed,
        uint256 refundabilityPeriod,
        uint256 deposit,
        uint256 closedPeriod,
        uint256 sellPrice
    );

    event HourlyPriceUpdated(uint256 indexed boatId, uint256 newHourlyPrice);

    event DailyPriceUpdated(uint256 indexed boatId, uint256 newDailyPrice);

    event CurrentlyListedUpdated(
        uint256 indexed boatId,
        bool newCurrentlyListed
    );

    event ClosedPeriodUpdated(uint256 indexed boatId, uint256 newClosedPeriod);

    event RefundabilityPeriodUpdated(
        uint256 indexed boatId,
        uint256 newRefundabilityPeriod
    );

    event depositUpdated(uint256 indexed boatId, uint256 newDepositPrice);

    event sellPriceUpdated(uint256 indexed boatId, uint256 newSellPrice);

    // Mapping to store information about each boat based on its unique boatId.
    // It associates each boatId with a corresponding Boat struct, allowing efficient access to boat details.
    mapping(uint => Boat) public boats;

    constructor() ERC721("Boat NFT", "BOAT") {
        owner = payable(msg.sender);
    }

    function mint(
        string memory tokenURI,
        uint256 hourlyPrice,
        uint256 dailyPrice,
        bool currentlyListed,
        uint256 refundabilityPeriod,
        uint256 deposit,
        uint256 closedPeriod,
        uint256 _sellPrice
    ) public payable returns (uint) {
        //Increment the baotId counter, which is keeping track of the number of minted NFTs
        _boatIds.increment();
        uint256 newBoatId = _boatIds.current();

        //Mint the NFT with boatId newBoatId to the address who called mint
        _safeMint(msg.sender, newBoatId);

        //Map the boatId to the tokenURI (which is an IPFS URL with the NFT metadata)
        _setTokenURI(newBoatId, tokenURI);

        //Helper function to update Global variables and emit an event
        createListedToken(
            newBoatId,
            hourlyPrice,
            dailyPrice,
            currentlyListed,
            refundabilityPeriod,
            deposit,
            closedPeriod,
            _sellPrice
        );

        return newBoatId;
    }

    function createListedToken(
        uint256 boatId,
        uint256 hourlyPrice,
        uint256 dailyPrice,
        bool currentlyListed,
        uint256 refundabilityPeriod,
        uint256 deposit,
        uint256 closedPeriod,
        uint256 _sellPrice
    ) private {
        require(hourlyPrice > 0, "Price must be greater than zero");

        boats[boatId] = Boat(
            boatId,
            payable(msg.sender),
            hourlyPrice,
            dailyPrice,
            currentlyListed,
            refundabilityPeriod,
            deposit,
            closedPeriod,
            _sellPrice
        );

        _transfer(msg.sender, address(this), boatId);
        emit BoatListedSuccess(
            boatId,
            address(this),
            hourlyPrice,
            dailyPrice,
            currentlyListed,
            refundabilityPeriod,
            deposit,
            closedPeriod,
            _sellPrice
        );
    }

    function updateTokenURI(uint256 boatId, string memory newTokenURI) public {
        require(_exists(boatId), "Token with given ID does not exist");
        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only nft owner or contract owner can update URI"
        );
        _setTokenURI(boatId, newTokenURI);
    }

    function updateHourlyPrice(uint256 boatId, uint256 newHourlyPrice) public {
        require(_exists(boatId), "Token ID does not exist");
        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only the nft owner or contract owner can update the hourly price"
        );

        boats[boatId].hourlyPrice = newHourlyPrice;
        emit HourlyPriceUpdated(boatId, newHourlyPrice);
    }

    function updateDailyPrice(uint256 boatId, uint256 newDailyPrice) public {
        require(_exists(boatId), "Token ID does not exist");
        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only the nft owner or contract owner can update the daily price"
        );

        boats[boatId].dailyPrice = newDailyPrice;
        emit DailyPriceUpdated(boatId, newDailyPrice);
    }

    function updateStatus(uint256 boatId, bool newStatus) public {
        require(_exists(boatId), "Token ID does not exist");
        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only the nft owner or contract owner can update if currently listed"
        );

        boats[boatId].currentlyListed = newStatus;
        emit CurrentlyListedUpdated(boatId, newStatus);
    }

    function updateClosedPeriod(uint256 boatId, uint256 newPeriod) public {
        require(_exists(boatId), "Token ID does not exist");
        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only the nft owner or contract owner can update if currently listed"
        );

        boats[boatId].closedPeriod = newPeriod;
        emit ClosedPeriodUpdated(boatId, newPeriod);
    }

    function updateRefundabilityPeriod(
        uint256 boatId,
        uint256 newPeriod
    ) public {
        require(_exists(boatId), "Token ID does not exist");
        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only the owner of the nft or contract owner can update the new period"
        );

        boats[boatId].refundabilityPeriod = newPeriod;
        emit RefundabilityPeriodUpdated(boatId, newPeriod);
    }

    function updateDeposit(uint256 boatId, uint256 newDeposit) public {
        require(_exists(boatId), "Token ID does not exist");
        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only the owner of the nft or contract owner can update the new period"
        );

        boats[boatId].deposit = newDeposit;
        emit depositUpdated(boatId, newDeposit);
    }

    function updateSellPrice(uint256 boatId, uint256 newSellPrice) public {
        require(_exists(boatId), "Token ID does not exist");

        require(
            ownerOf(boatId) == msg.sender || msg.sender == owner,
            "Only the owner of the nft or contract owner can update the new period"
        );

        boats[boatId].sellPrice = newSellPrice;
        emit sellPriceUpdated(boatId, newSellPrice);
    }

    function getAllNFTs() public view returns (Boat[] memory) {
        uint nftCount = _boatIds.current();
        Boat[] memory tokens = new Boat[](nftCount);

        for (uint i = 1; i <= nftCount; i++) {
            Boat storage currentItem = boats[i];
            tokens[i - 1] = currentItem;
        }

        return tokens;
    }

    //Returns all the NFTs that the current user is owner
    function getMyNFTs() public view returns (Boat[] memory) {
        uint totalBoatCount = _boatIds.current();
        uint itemCount = 0;
        uint currentId;

        // Count the number of relevant NFTs that belong to the user
        for (uint i = 0; i < totalBoatCount; i++) {
            if (boats[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        // Create an array to store all the relevant NFTs
        Boat[] memory items = new Boat[](itemCount);
        uint currentIndex = 0;

        // Store all the relevant NFTs in the array
        for (uint i = 0; i < totalBoatCount; i++) {
            if (boats[i + 1].owner == msg.sender) {
                currentId = i + 1;
                Boat storage currentItem = boats[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    function getListedBoatForId(
        uint256 boatId
    ) public view returns (Boat memory) {
        return boats[boatId];
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function executeSale(uint256 boatId) public payable {
        require(_exists(boatId), "Token ID does not exist");
        uint price = boats[boatId].sellPrice;
        address seller = boats[boatId].owner;
        address buyer = msg.sender;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        //Actually transfer the token to the new owner
        _transfer(address(this), msg.sender, boatId);

        // Update the details of the token
        boats[boatId].owner = payable(buyer);

        //unlist items in case new owner wants to make changes
        boats[boatId].currentlyListed = false;

        // Transfer the proceeds from the sale to the seller of the NFT
        payable(seller).transfer(msg.value);
    }
}
