const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

const { httpError } = require("../helpers");

const User = require("../models/user");

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    next(httpError(401, "Not authorized"));
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);

    if (!user || !user.token) {
      next(httpError(401, "Not authorized"));
    }

    req.user = user;
    
    next();

  } catch {
    next(httpError(401, "Not authorized"));
  }
};

module.exports = authenticate;
