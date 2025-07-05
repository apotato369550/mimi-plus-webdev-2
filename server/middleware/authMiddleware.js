const jwt = require("jsonwebtoken");


exports.authenticateToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];

  if(!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing"});

  }

  const token = authHeader.split(' ')[1];


  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if(err) {

      return res.status(403).json({ message: "Invalid token"});

    }

    req.user = decoded;

    next();
  });
};
