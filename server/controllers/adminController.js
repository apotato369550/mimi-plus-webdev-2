
const db = require('../database/dbconn');

const { queryAsync } = require("../database/utils");

/******************************************************************
 *                       Admin Dashboard                            
 ******************************************************************/

exports.adminDashboard = async (req, res) => {

  try {

    const customerResult = await queryAsync("SELECT COUNT(*) AS totalCustomers FROM customers");
    const totalCustomers = customerResult[0].totalCustomers;

    const redeemResult = await queryAsync("SELECT COUNT(*) AS totalRedeemed FROM redemption WHERE redeemStatus = 'approved'");
    const totalRedeemed = redeemResult[0].totalRedeemed;

    const pointsResult = await queryAsync("SELECT SUM(totalEarnedLifetime) AS totalPointsIssued FROM customers");
    const totalPointsIssued = pointsResult[0].totalPointsIssued || 0;

    const pendingResult = await queryAsync("SELECT COUNT(*) AS totalPendingRedemptions FROM redemption WHERE redeemStatus = 'pending'");
    const totalPending = pendingResult[0].totalPendingRedemptions; 
    

    res.status(200).json({ 

      totalCustomers,
      totalRedeemed,
      totalPointsIssued,
      totalPending


    });
  } catch(error) {

    console.error("Dashboard query error:", error);
    res.status(500).json({ message: "Server Error", error: error.message});

  }
};



/******************************************************************
 *                       View All Customers                            
 ******************************************************************/


exports.viewAllCustomers = async (req, res) => {

  try{

    const sql = 'SELECT customerID, name, email, dateJoined, pointsBalance FROM customers';
    const customers = await queryAsync(sql);

    res.status(200).json({
      message: "All customers retrieved",
      customers: customers
    })
  } catch(error){


    console.error("Error fetching customers:", error);
    res.status(500).json({message: "Server Error", error: error.message});
  }

}
//Delete Customer
exports.deleteCustomer = async (req, res) => {

  const customerID = req.params.id;

  if(!customerID){

    return res.status(400).json({ message: 'Customer ID is required'});
  }


  try{

   const result = await queryAsync("DELETE FROM customers WHERE customerID = ?", [customerID]);

  

   if(result.affectedRows === 0){

      return res.status(404).json({ message: "Customer not found"});

    }

    res.status(200).json({ message: `Customer ${customerID} deleted customer successfully.`});



  }catch(error){
    
    console.error("Error deleting customer:", error);
    res.status(500).json({message: "Server Error", error: error.message});


  }
  
}

/******************************************************************
 *                       View All Rewards                            
 ******************************************************************/

exports.viewAllRewards = async (req, res) =>{

  
  try{

  const sql = "SELECT rewardID, rewardName, pointsRequired, category, isActive FROM rewards";

    const rewards = await queryAsync(sql);

    res.status(200).json({
      message: "All rewards",
      rewards: rewards
    });


  }catch(error){

    
    console.error("Error fetching rewards:", error);
    res.status(500).json({message: "Server Error", error: error.message});

  }
}


/******************************************************************
 *                     Add Points to the Customer                            
 ******************************************************************/

exports.addPoints = async (req, res) => {

 const customerID = req.params.customerID;

 const { paymentAmount } = req.body;


  if(!paymentAmount){

    return res.status(400).json({ message: "Payment amount is required"});

    
  }

  const pointsToAdd = Math.floor(paymentAmount / 50);

  try{
    

    await queryAsync("UPDATE customers SET  totalEarnedLifetime = totalEarnedLifetime + ?, pointsBalance = pointsBalance + ? WHERE customerID = ?", 
    [pointsToAdd, pointsToAdd, customerID]);

    await queryAsync("INSERT INTO transactions(customerID, paymentAmount, pointsChange, date) VALUES(?, ?, ?, NOW())", 
    [customerID, paymentAmount, pointsToAdd]);

    res.status(200).json({message: "Points Added successfully"});
  
  } catch (error){

    console.error(error);
    res.status(500).json({message: "Server Error", error: error.message});

  }

}

/******************************************************************
 *                       After scanning the QR Code                          
 ******************************************************************/

exports.viewCustomerPage = async(req, res) => {

  const customerID = req.params.customerID;
  
  console.log("customerid: ", customerID);
  try{
      const customer = await queryAsync("SELECT customerID, name, totalEarnedLifetime FROM customers WHERE customerID = ?", 
      [customerID]);

      if(customer.length === 0){

      return res.status(404).json({message: "Customer not found"});

      }

    const pending = await queryAsync("SELECT * FROM redemption WHERE customerID = ? AND redeemStatus = 'pending'",
    [customerID]);

    res.status(200).json({
      customer: customer[0],
      pendingRedemptions: pending
    });

  } catch(error) {

    
    console.error(error);
    res.status(500).json({message: "Server Error", error: error.message});
  }

}
