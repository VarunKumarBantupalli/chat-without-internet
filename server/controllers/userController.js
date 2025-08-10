// server/controllers/userController.js
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';


//controller for creating a user
export const createUser = async (req, res) => {
  try {
    const { name, mobile, address, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      image: req.file.path, // Cloudinary URL  
      name,
      mobile,
      address,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//controller for logging-in a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    res.status(200).json({
      message: "Login successful",
      user: existingUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

