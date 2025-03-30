const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const apiRoutes = require("./Routes/route");
const authentication = require("./middleware/middleware");

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://chatting-application-socket.vercel.app", // Replace with your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", apiRoutes);

module.exports = app;
