import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import contestRoutes from "./routes/contestRoute.js";
import { connectToDatabase } from "./utils/dbConnect.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON body

app.use("/api/auth", authRoutes);
app.use("/api/contests", contestRoutes);
app.get("/" , (req,res)=>{
  res.send("Hello")
})
connectToDatabase()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Server failed to start:", error);
  });