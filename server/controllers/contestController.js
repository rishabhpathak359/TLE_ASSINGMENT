import prisma from "../utils/dbConnect.js";

export const contests = async (req, res) => {
  try {
    let { platforms = "all", page = 1, limit = 10, type = "all" } = req.query;

    console.log(`📌 Fetching contests: platforms=${platforms}, type=${type}, page=${page}, limit=${limit}`);

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    let whereClause = {};

    if (platforms !== "all") {
      const selectedPlatforms = platforms.split(",").map((p) => p.trim().toUpperCase());
      if (selectedPlatforms.length > 0) {
        whereClause.platform = { in: selectedPlatforms };
      }
    }

    const contestType = type.trim().toLowerCase();
    
    if (contestType === "upcoming") {
      whereClause.contestDateTime = { gte: new Date() };
    } else if (contestType === "past") {
      whereClause.contestDateTime = { lt: new Date() }; 
    }

    // console.log("🕒 Current Date:", currentDateTime);
    // console.log("🔍 Filter Conditions:", JSON.stringify(whereClause, null, 2));

    const totalContests = await prisma.contests.count({ where: whereClause });

    const contests = await prisma.contests.findMany({
      where: whereClause,
      orderBy: { contestDateTime: "asc" }, 
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      success: true,
      totalContests,
      currentPage: page,
      totalPages: Math.ceil(totalContests / limit),
      contests,
    });

  } catch (error) {
    console.error("❌ Error fetching contests:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
