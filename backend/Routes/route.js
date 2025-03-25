const express = require("express");
const router = express.Router();
const {getUsers,getConv, getId} = require("../Controller/users")
const {Login,Register} = require("../Controller/auth");

router.post("/login",Login);
router.post("/register", Register);
router.get("/getusers",getUsers);
router.post("/conversation",getConv);
router.post("/getId",getId)

module.exports = router;