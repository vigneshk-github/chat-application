const jwt = require("jsonwebtoken");

function authentication(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token missing" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or Expired Token" });
      }
      req.user = user;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = authentication;
