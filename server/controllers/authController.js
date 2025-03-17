import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/dbConnect.js";

const JWT_SECRET = process.env.JWT_SECRET; 

export const signup = async (req, res) => {
  try {
    let { name, email, password, type = "USER" } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        type,
      },
    });
    const token = jwt.sign({ userId: newUser.id, type: newUser.type }, JWT_SECRET, {
      expiresIn: "7d", 
    });
    res.status(201).json({ message: "User registered successfully", user: newUser, token });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ User Login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id, type: user.type }, JWT_SECRET, {
      expiresIn: "7d", 
    });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
