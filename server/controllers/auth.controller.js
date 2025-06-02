const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private (System Admin only)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Send response without token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user and populate assignedBlocks
    const user = await User.findOne({ email }).select('+password').populate('assignedBlocks');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedBlocks: user.assignedBlocks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+createdAt').populate('assignedBlocks');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    // Check if it's the hardcoded admin user
    if (req.user?._id === 'admin_id_123') {
        console.log('Auth Controller: Handling profile update for hardcoded admin.');
        // For hardcoded admin, we don't save to DB.
        // We can simulate a successful update response.
        const updatedAdminUser = { ...req.user, ...req.body };
        // Handle profile picture: For hardcoded admin, we can't save a file to a DB record.
        // You might decide to store it elsewhere or return a specific message.
        // For now, we'll just acknowledge the request without actually saving the file to the user model.
        if (req.file) {
            console.log('Auth Controller: Profile picture upload attempted for hardcoded admin. File not saved to DB.');
            // Optionally add logic to save the file to a temp location or return a different response.
            // For this implementation, we just proceed without saving to the user model.
        }

        return res.status(200).json({
            success: true,
            message: 'Profile update simulated for hardcoded admin.',
            user: updatedAdminUser // Return the potentially updated user object
        });
    }

    // For database-backed users
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('Auth Controller: User not found in DB for update profile:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    
    // Handle profile picture upload
    if (req.file) {
      // You might want to delete the old profile picture file here
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Fetch the updated user again, possibly populating fields if needed for the response
    const updatedUser = await User.findById(user._id).populate('assignedBlocks');

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Auth Controller: Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
