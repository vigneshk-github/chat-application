const express = require("express");
const router = express.Router();
const {
  getUsers,
  getConv,
  getId,
  checkUserExists,
  googleSignUp,
} = require("../Controller/users");
const { Login, Register, VerifyEmail } = require("../Controller/auth");

router.post("/login", Login);
router.post("/register", Register);
router.get("/verify",VerifyEmail);
router.post("/userexistsbyemail", checkUserExists);
router.post("/googlesignup",googleSignUp);
router.get("/getallusers", getUsers);
router.post("/getId", getId);

router.post("/conversation", getConv);

module.exports = router;
