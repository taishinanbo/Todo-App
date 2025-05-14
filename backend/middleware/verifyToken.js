const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json("Access Denied");

  const token = authHeader.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // user.id などが使える
    next();
  } catch (err) {
    res.status(403).json("Invalid Token");
  }
}

module.exports = verifyToken;