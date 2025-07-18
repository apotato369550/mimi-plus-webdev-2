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
