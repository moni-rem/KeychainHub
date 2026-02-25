const { prisma } = require("../config/db.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");

const register = async (req, res) => {
  // const body = req.body; // this part is use to send the data into the body
  const { name, email, password } = req.body; // this part is use to send the data into the body
  // and it required (name, email, password) for register
  //check if user already exists(មាន)
  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (userExists) {
    return res
      .status(400)
      .json({ error: "User already exists with this email" });
  }

  // Hash Password// use bcrypt to convert password to hash
  const salt = await bcrypt.genSalt(10); // genSalt use to generate the salt and 10 is the round of salt // and what is salt ? salt is random string that add to password to make it more secure
  const hashPassword = await bcrypt.hash(password, salt);

  // create User
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    }, // this part is use to send the data into the body
  });

  //Generate JWT token
  const token = generateToken(user.id, res);

  //when access create user
  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: email,
        name: user.name,
        isAdmin: user.isAdmin || false,
      },
      token: token,
    },
  });
};

//--------------------------------------------------------------------------------------
// this part is about login function
const login = async (req, res) => {
  const { email, password } = req.body; // but login just need email and password

  //find to see if user with email and pass to login
  // it exactly the same with register to checking the user exist(មាន)
  // check if user email exists in the table(database)
  const user = await prisma.user.findUnique({
    // findUnique use for check the unique such as (email, password, or ,, that u put on code where : {email})
    where: { email: email },
  });
  //return error when check user are not register yet
  if (!user) {
    //if not user then error
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // verify password
  //use compare to compare the password that store in table database and the password that user input to login
  const isPasswordValid = await bcrypt.compare(password, user.password);

  // so i have a condition if user password are not valid it show error
  // that mean if user input password that not match with the password that store in database it show error
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  //Generate JWT token
  const token = generateToken(user.id, res);

  //when access create user
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: email,
        name: user.name,
        isAdmin: user.isAdmin || false,
      },
      token: token,
    },
  });
};

// this part is for logout function and use cookie to clear the jwt token and expire it immediately(ភ្លាមៗ)
const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Set cookie to expire immediately
  });
  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
};

// ============================================
// NEW FUNCTION: Make a user an admin (for testing)
// ============================================
// This function allows you to set a user as admin by email
// IMPORTANT: In production, you should protect this with additional security
const makeAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found with this email",
      });
    }

    // Update user to be admin
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "User is now an admin",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Error in makeAdmin:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to make user admin",
    });
  }
};

// ============================================
// OPTIONAL: Get current user profile
// ============================================
const getProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        avatar: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get profile",
    });
  }
};

// ============================================
// OPTIONAL: Get all users (admin only)
// ============================================
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin only.",
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        avatar: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      data: { users },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get users",
    });
  }
};

// Export all functions
module.exports = {
  register,
  login,
  logout,
  makeAdmin, // New function
  getProfile, // Optional: for getting user profile
  getAllUsers, // Optional: for admin to see all users
};
