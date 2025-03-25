const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


async function Register(req,res) {
      const { email, password } = req.body;
    
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
    
        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }
    
        const hashpass = await bcrypt.hash(password, 10);
    
        const user = await prisma.user.create({
          data: { email, password: hashpass },
        });
    
        res.status(201).json({ message: "User registered successfully", user });
      } catch (err) {
        console.log(err);
        
        res
          .status(500)
          .json({ error: "Something went wrong", details: err.message });
      }
}

async function Login(req,res) {
    const { email, password } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "User Doesn't Exist" });
      }

      if (await bcrypt.compare(password, existingUser.password)) {
        const accessToken = jwt.sign(
          { userId: existingUser.id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.cookie("token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ message: "Successful Login" });
      } else {
        return res.status(400).json({ error: "Password is Incorrect" });
      }
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
}

module.exports = {Login,Register};