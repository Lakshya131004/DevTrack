const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware — verifies the JWT token sent in the Authorization header.
 * Attaches the authenticated user to req.user for downstream controllers.
 */
const protect = async (req, res, next) => {
  let token;

  // Token expected as: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized. No token provided.' });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach fresh user doc (without password) to the request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Not authorized. User no longer exists.' });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: 'Not authorized. Token is invalid or expired.' });
  }
};

module.exports = { protect };
