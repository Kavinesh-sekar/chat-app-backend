const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res) => {
  try {
   
    console.log('inside register',req.body);

    const {userName ,email,password} = req.body;
    

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Save the new user
    const newUser = new User({ userName, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Error registering user', error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('inside login');
    

    const user = await User.findOne({ email });
    console.log('users',user);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // const isPasswordCorrect = await User.comparePassword(password);
    if(password !=user.password){
        res.status(400).json({message:'Invalid credentials'});
    }
    else{

    res.status(200).json({ message: 'Login successful' });}
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

module.exports = { register, login };
