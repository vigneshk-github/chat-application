const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const prisma = new PrismaClient();

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({});
    res.status(200).json({ users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ Error: err });
  }
}

async function getId(req, res) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ id: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function checkUserExists(req, res) {
  try {
    const { email } = req.body;
    const userDetail = await prisma.user.findFirst({
      where: { email },
    });
    console.log(userDetail);
    res.status(200).json({ userDetail });
  } catch (err) {
    res.status(500).json({ err });
  }
}

async function googleSignUp(req, res) {
  try {
    const { email, name, image } = req.body;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const user = await prisma.user.create({
        data: {
          email: "vigneshten5@gmail.com",
          name: "Vignesh Kamatam",
          image: undefined,
          emailVerified: new Date(),
          accounts: {
            create: [
              {
                provider: "google",
                providerAccountId: "vigneshten5@gmail.com",
                type: "oauth", // Ensure type is correctly provided
              },
            ],
          },
        },
      });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Google Signup Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getConv(req, res) {
  try {
    const { to, from } = req.body;

    // Find users
    const user1 = await prisma.user.findFirst({ where: { email: to } });
    const user2 = await prisma.user.findFirst({ where: { email: from } });

    if (!user1 || !user2) {
      return res.status(404).json({ error: "One or both users not found" });
    }

    // Get conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { userAId: user1.id, userBId: user2.id },
          { userAId: user2.id, userBId: user1.id },
        ],
      },
      include: { messages: true }, // Include messages in the response
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getUsers, getConv, getId, checkUserExists, googleSignUp };
