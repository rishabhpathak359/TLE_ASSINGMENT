import express from "express";
import { addBookmark, getBookmarks, removeBookmark } from "../controllers/bookmarksController.js";

const router = express.Router();

router.post("/bookmarks", addBookmark);
router.delete("/bookmarks", removeBookmark);
router.get("/bookmarks", getBookmarks);

export default router;
 