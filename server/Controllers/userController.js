const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

//create Token
const createToken = (_id) =>{
    const jwtkey = process.env.JWT_SECRET_KEY;

    return jwt.sign({_id}, jwtkey, {expiresIn: "3d"});
}

const registerUser = async (req,res) => {

    try{
    const {name, email, password} = req.body

    let user = await userModel.findOne({email});

    if(user) return res.status(400).json("User already exist...");

    if (!name || !email || !password ) return res.status(400).json("All fields are required ...");

    if (!validator.isEmail(email)) return res.status(400).json("Email must be a valid email..");

    if (!validator.isStrongPassword(password))
        return res.status(400).json("Password must be a strong password...");

    user = new userModel({name, email, password});

    //crypt the password

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    //save the user in the database
    await user.save()

    //generate a token 
    const token = createToken(user._id);

    res.status(200).json({_id: user._id, name, email, token})
}catch(error){
    console.log(error);
    res.status(500).json(error);
}

};

//login 

const loginUser = async (req,res) => {
    const {email,password} = req.body;

    try{
        let user = await userModel.findOne({email});

        if (!user) return res.status(400).json("Invalid email or password...");
        
        const isValidPassword = await bcrypt.compare(password, user.password );

        if (!isValidPassword)
            return res.status(400).json("Invalid email or password...");

        const token = createToken(user._id);

        res.status(200).json({_id: user._id, name:user.name, email, token});

    }catch(error){

    }
};

//function to find a user
const findUser = async(req,res) => {
    const userId = req.params.userId;
    try{
        const user = await userModel.findById(userId);

        res.status(200).json(user);
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

//function to get all users
const getAllUser = async(req,res) => {
    
    try{
        const users = await userModel.find();

        res.status(200).json(users);
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = {registerUser, loginUser , findUser, getAllUser};