// look at line 573 of rentals test
//first we get the rental token from uuid
const rentalId = await ahoyRentals.fromUuid(uuid);
// returning the boat we do both of the calls below 
await ahoyRentals.connect(accounts[0]).setInspectionPassed(rentalId, true);
// when this is successful, rental has completed
const rentalCompleted = await ahoyRentals.rentalCompleted(rentalId);
