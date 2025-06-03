const User = require('../models/User');

// Protect middleware
exports.protect = async (req, res, next) => {
  try {
    console.log('Auth Middleware: Protect middleware hit');
    console.log('Auth Middleware: Request headers:', req.headers);
    
    // Get user from localStorage via request headers
    const userData = req.headers['x-user-data'];
    
    if (!userData) {
      console.log('Auth Middleware: No user data in headers');
      return res.status(401).json({
        success: false,
        message: 'Not authorized: No user data in headers'
      });
    }

    // Parse user data from header
    let user;
    try {
        user = JSON.parse(userData);
        console.log('Auth Middleware: Successfully parsed user data:', user);
        console.log('Auth Middleware: Type of parsed user object:', typeof user);
        console.log('Auth Middleware: Does parsed user have _id property?', user && user.hasOwnProperty('_id'));
        console.log('Auth Middleware: Value of parsed user._id:', user?._id);
        console.log('Auth Middleware: Type of parsed user._id:', typeof user?._id);

    } catch (parseError) {
        console.error('Auth Middleware: Error parsing user data from headers:', parseError);
         return res.status(401).json({
            success: false,
            message: 'Not authorized: Invalid user data format'
        });
    }

    // *** Handle hardcoded admin user separately ***
    if (user?._id === 'admin_id_123') {
        console.log('Auth Middleware: Authenticating hardcoded admin user.');
        // Manually create a user object for the hardcoded admin
        req.user = {
            _id: 'admin_id_123',
            role: 'systemAdmin', // Assuming the hardcoded admin is systemAdmin
            name: 'System Administrator',
            email: 'admin@facility.com'
        };
        console.log('Auth Middleware: Hardcoded admin user attached to req.user:', req.user);
        return next();
    }

    // *** For other users, proceed with database lookup ***
    // Explicitly check if user is a valid object and has a non-empty _id string
    if (!user || typeof user !== 'object' || !user._id || typeof user._id !== 'string' || user._id.length === 0) {
      console.log('Auth Middleware: User data validation failed for non-admin.', { 
        user: user, 
        hasId: user && user.hasOwnProperty('_id'), 
        idValue: user?._id, 
        idType: typeof user?._id 
      });
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid user data (missing or invalid ID)'
      });
    }

    console.log('Auth Middleware: User data validated. Attempting to find user by ID:', user._id);
    // Find user in database
    const dbUser = await User.findById(user._id);
    
    if (!dbUser) {
      console.log('Auth Middleware: User not found in database for ID:', user._id);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User not found'
      });
    }

    // Add user to request object
    req.user = dbUser;
    console.log('Auth Middleware: User found and attached to req.user:', {
      id: req.user._id,
      role: req.user.role,
      name: req.user.name
    });
    next();
  } catch (err) {
    console.error('Auth Middleware: Uncaught error during protection:', err);
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Server error during authentication'
    });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Auth Middleware: Authorize middleware hit');
    console.log('Auth Middleware: Required roles:', roles);
    console.log('Auth Middleware: User role from req.user:', req.user?.role);

    if (!req.user) {
      console.log('Auth Middleware: Authorize check failed - req.user not set');
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User not authenticated for authorization check'
      });
    }

    if (!roles.includes(req.user.role)) {
       console.log(`Auth Middleware: Authorization failed for user ${req.user.id} with role ${req.user.role}. Required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role ${req.user.role} is not authorized to access this route`
      });
    }
    console.log(`Auth Middleware: Authorization successful for user ${req.user.id} with role ${req.user.role}`);
    next();
  };
};
