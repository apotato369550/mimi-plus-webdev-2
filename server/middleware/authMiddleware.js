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
    //console.log("decoded:", decoded);

    req.user = decoded;

    next();
  });
};


exports.adminVerify = (req, res, next) => {


  if (req.user && req.user.role === 'admin'){
    next();
  } else {
    return res.status(403).json({ message: "Access Denied: Admins Only"});
  }
}

exports.authenticateStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: "Access Denied: Staff Only" });
  }
};
