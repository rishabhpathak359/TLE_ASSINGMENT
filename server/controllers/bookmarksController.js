import prisma from "../utils/dbConnect.js";
export const addBookmark =  async (req, res) => {
  try {
    const { userId, contestId } = req.body;

    if (!userId || !contestId) {
      return res.status(400).json({ message: "userId and contestId are required" });
    }

    // Check if the bookmark already exists
    const existingBookmark = await prisma.bookmarks.findFirst({
      where: { userId, contestId },
    });

    if (existingBookmark) {
      return res.status(400).json({ message: "Already bookmarked" });
    }

    const bookmark = await prisma.bookmarks.create({
      data: { userId, contestId },
    });

    res.status(201).json({ message: "Bookmarked successfully", bookmark });
  } catch (error) {
    console.error("Error bookmarking contest:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔹 Remove a Bookmark
export const removeBookmark =  async (req, res) => {
  try {
    const { userId, contestId } = req.body;

    if (!userId || !contestId) {
      return res.status(400).json({ message: "userId and contestId are required" });
    }

    const deletedBookmark = await prisma.bookmarks.deleteMany({
      where: { userId, contestId },
    });

    if (deletedBookmark.count === 0) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔹 Get All Bookmarked Contests for a User
export const getBookmarks = async (req, res) => {
  try {
    let { userId, platforms = "all" } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let whereClause = { userId };

    if (platforms !== "all") {
      const selectedPlatforms = platforms.split(",").map((p) => p.trim().toUpperCase());
      if (selectedPlatforms.length > 0) {
        whereClause.contest = { platform: { in: selectedPlatforms } };
      }
    }

    const bookmarks = await prisma.bookmarks.findMany({
      where: whereClause,
      include: { contest: true },
    });

    res.json({ bookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// export default router;
