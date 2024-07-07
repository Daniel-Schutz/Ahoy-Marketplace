module.exports = async (req, res) => {
    const { boat_uuid} = req.body;
  
    try {
        //first we get the rental token from uuid
        const rentalId = await ahoyRentals.fromUuid(boat_uuid);

        // returning the boat we do both of the calls below 
        await ahoyRentals.connect(accounts[0]).setInspectionPassed(rentalId, true);

        // when this is successful, rental has completed
        const rentalCompleted = await ahoyRentals.rentalCompleted(rentalId);

        // Send a success response
        res.status(200).send({ success: true, message: 'Rental completed successfully.' });
    } catch (error) {
        // Handle errors and send a failure response
        console.error(error);
        res.status(500).send({ success: false, error: error.message });
    }
  };
  



