const db = require("../database/dbconn");
const { queryAsync } = require("../database/utils");



exports.viewAllRewards = async (req, res) => {
  try {
    const showInactive = req.query.showInactive === "true";

    let sql =
      "SELECT rewardID, rewardName, pointsRequired, category, isActive, brand, description FROM rewards";

    if (!showInactive) {
      sql += " WHERE isActive = 'active'";
    }

    sql += " ORDER BY rewardID DESC";

    const rewards = await queryAsync(sql);

    res.status(200).json({
      message: "All rewards",
      rewards: rewards,
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateRewardName = async(req, res) => {

  try{

    const { rewardID } = req.params;
    const { rewardName } = req.body;


    if(!rewardID){
      
      return res.status(400).json({ message: 'Invalid reward id'});
    }

    if(!rewardName || typeof rewardName !== 'string'){
      return res.status(400).json({
        message: 'Name is required and must be a string'
      });
    }

    const trimmedName = rewardName.trim();

    if(!trimmedName){
      return res.status(400).json({
        message: 'Name cannot be empty or just whitespace'
      });
    }

    const result = await queryAsync('UPDATE rewards SET rewardName = ? WHERE rewardID = ?', [trimmedName, rewardID]);
    
    if(result.affectedRows === 0){
      return res.status(404).json({
        message: 'Reward not found'
      })
    }

    res.status(200).json({
      message: 'Rewarad name updated successfully',
      rewardID: rewardID,
      newName: trimmedName
    });
  } catch(error){

    console.error('Error updating reward name:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

exports.updateRewardCategory = async(req, res) => {

  try{

    const { rewardID } = req.params;
    const { rewardCategory } = req.body;


    if(!rewardID){
      
      return res.status(400).json({ message: 'Invalid reward id'});
    }

    if(!rewardCategory || typeof rewardCategory !== 'string'){
      return res.status(400).json({
        message: 'Category is required and must be a string'
      });
    }

    const trimmedName = rewardCategory.trim();

    if(!trimmedName){
      return res.status(400).json({
        message: 'Category cannot be empty or just whitespace'
      });
    }

    const result = await queryAsync('UPDATE rewards SET category = ? WHERE rewardID = ?', [trimmedName, rewardID]);
    
    if(result.affectedRows === 0){
      return res.status(404).json({
        message: 'Reward not found'
      })
    }

    res.status(200).json({
      message: 'Reward category updated successfully',
      rewardID: rewardID,
      newCategory: trimmedName
    });
  } catch(error){

    console.error('Error updating reward category:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
};



exports.updateRewardBrand = async(req, res) => {

  try{

    const { rewardID } = req.params;
    const { rewardBrand } = req.body;


    if(!rewardID){
      
      return res.status(400).json({ message: 'Invalid reward id'});
    }

    if(!rewardBrand || typeof rewardBrand !== 'string'){
      return res.status(400).json({
        message: 'Brand is required and must be a string'
      });
    }

    const trimmedName = rewardBrand.trim();

    if(!trimmedName){
      return res.status(400).json({
        message: 'Brand cannot be empty or just whitespace'
      });
    }

    const result = await queryAsync('UPDATE rewards SET brand = ? WHERE rewardID = ?', [trimmedName, rewardID]);
    
    if(result.affectedRows === 0){
      return res.status(404).json({
        message: 'Reward not found'
      })
    }

    res.status(200).json({
      message: 'Reward brand updated successfully',
      rewardID: rewardID,
      newBrand: trimmedName
    });
  } catch(error){

    console.error('Error updating reward brand:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
};

exports.updatePointsRequired = async(req, res) => {

  try {
    const { rewardID } = req.params;
    const { pointsRequired } = req.body;

    // Validate inputs
    if (!rewardID) {
      return res.status(400).json({ message: 'Invalid reward ID' });
    }

    if (!pointsRequired) {
      return res.status(400).json({ 
        message: 'Points value is required and must be a number' 
      });
    }

    const points = parseInt(pointsRequired);

    if (points <= 0) {
      return res.status(400).json({ 
        message: 'Points value must be a positive integer' 
      });
    }

    // Update in database
    const result = await queryAsync(
      `UPDATE rewards 
       SET pointsRequired = ? WHERE rewardID = ?`,
      [points, rewardID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Reward not found with the specified ID' 
      });
    }

    // Return updated reward
    const updatedReward = await queryAsync(
      `SELECT rewardID, rewardName, pointsRequired 
       FROM rewards 
       WHERE rewardID = ?`,
      [rewardID]
    );

    res.status(200).json({
      message: 'Reward points updated successfully',
      reward: updatedReward[0]
    });

  } catch (error) {
    console.error('Error updating reward points:', error);
    res.status(500).json({ 
      message: 'Server error while updating reward points',
      error: error.message 
    });
 }
}
