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
  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: email,
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

module.exports = { register, login, logout };

// here is the work flow register:
//1. check  if user already exists(មាន)
//if it have user it show User already exists with this email"

// 2.  use bcrypt to convert password to hash
//3.create user register
// when create access it show success

// for login flow :
// 1. check to find the unique email and pass
//2.return error when check user are not register yet
// findUnique use for check the unique such as (email, password, or ,, that u put on code where : {email})
//3.verify password
//use compare to compare the password that store in table
//4.check condition if user password are not valid or invalid it show error

// so here is the whole flow of register and login function in authController.js file
// that use prisma as ORM to interact with database and bcryptjs to hash password
// and jsonwebtoken to generate JWT token for authentication
// and also set cookie in the response for storing the token in client side
// and enhance security by setting httpOnly, secure, sameSite and maxAge options in the cookie
// and finally export the register and login function to use in authRoutes.js file

// fro register function:
// 1. check if user already exists
// 2. hash password bcrypt
// 3. create user
// 4. generate JWT token
// 5. send response with user data and token

// for login function:
// 1. find user by email
// 2. verify password
// 3. generate JWT token
// 4. send response with user data and token

// for logout function:
// 1. clear the jwt cookie
// 2. send response with success message
