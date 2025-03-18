import prisma from "../utils/dbConnect.js";
import axios from "axios";

// Clist API Configuration
const CLIST_API_KEY = "YOUR_CLIST_API_KEY"; // Replace with actual key
const CLIST_API_URL = "https://clist.by/api/v4/contest/";

export const addBookmark = async (req, res) => {
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

export const removeBookmark = async (req, res) => {
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

export const getBookmarks = async (req, res) => {
  try {
    const { userId } = req.query; // Ensure userId is coming from request

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Get contest IDs from database
    const bookmarks = await prisma.bookmarks.findMany({
      where: { userId },
      select: { contestId: true },
    });

    const contestIds = bookmarks.map((b) => b.contestId);

    if (contestIds.length === 0) {
      return res.json({ success: true, contests: [] });
    }

    // Fetch contest details from Clist API
    const contestDetails = await fetchContestsFromClist(contestIds);

    res.json({ success: true, contests: contestDetails });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchContestsFromClist = async (contestIds) => {
  try {
    const contests = await Promise.all(
      contestIds.map(async (id) => {
        try {
          const response = await axios.get(`${CLIST_API_URL}${id}/`, {
            headers: {
              Authorization: process.env.CLIST_API_KEY,
            },
          });
          return response.data;
        } catch (error) {
          console.error(`Error fetching contest ${id}:`, error.message);
          return null;
        }
      })
    );

    return contests.filter((contest) => contest !== null);
  } catch (error) {
    console.error("Error fetching from Clist API:", error);
    return [];
  }
};
