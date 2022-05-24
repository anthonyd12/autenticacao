//imports
require('dotenv').config()
const express = require ('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()





//config json response
    app.use(express.json())





//models
    const User = require('./models/User')





//Open Route - public
    app.get('/',(req,res)=> {
        res.status(200).json({ msg: "Welcome the new API" })
    })





//private - route
    app.get("/user/:id", async(req, res) => {
        const id = req.params.id


        //check if user exists
        const user = await User.findById(id, '-passorwd')
        if(!user){
            return res.status(404).json({msg: "User not found"})
        }
        res.status(200).json({ user })

    })

function checkToken(req, res, next) {
    const authHeader = req.headers('authorization')
    const token = authHeader && authHeader.split("")[1]

    if(!token) {
        return res.status(401).json({msg: "Acess negate"})
    }
}



//register user
    app.post('/auth/register', async(req, res) => {
        const { name, email, password, confirmpassword } = req.body



    //validations
    if(!name) {
        return res.status(422).json({msg: 'Put a name'})
    }
    if(!email) {
        return res.status(422).json({msg: 'Put an email'})
    }
    if(!password) {
        return res.status(422).json({msg: 'Put a password'})
    }
    if(password !== confirmpassword) {
        return res.status(422).json({ msg: 'Passwords do not match'})
    }



    // check if user exists
    const userExists = await User.findOne({ email: email })

    if (userExists){
        return res.status(422).json({msg: 'E-mail already registered'})
    }



    
//create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)





//create user
    const user = new User({
        name,
        email,
        password: passwordHash,
})

    try {

        await user.save()
        res.status(201).json({msg: "User created successfully"})

    } catch(error) {
        res.status(500).json({msg: "Erro no server"})
    }
})





//login
    app.post("/auth/login", async (req, res) => {
        const {email, password} = req.body



    //validations
        if(!email) {
            return res.status(422).json({msg: 'Put an email'})
        }
        if(!password) {
            return res.status(422).json({msg: 'Put a password'})
    }



//check if user exist
    const user = await User.findOne({ email: email })

    if (!user){
        return res.status(404).json({msg: 'user not found'})
    }




//check if passowrd match
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword){
        return res.status(422).json({msg: 'password invalid'})
    }

    try{
        const secret = process.env.SECRET

        const token = jwt.sign(
        {
            id: user._id,
        },
        secret,
        )

        res.status(200).json({msg: "authentication completed", token})
    } catch(err){
        res.status(500).json({msg: "Erro no server"})
    }
})





//credenciais
    const dbUser = process.env.DB_USER
    const dbPassword = process.env.DB_PASS

    mongoose.connect(
        `mongodb+srv://${dbUser}:${dbPassword}@cluster0.5eijq.mongodb.net/?retryWrites=true&w=majority`)
        .then(()=> {
        app.listen(3000)
        console.log("conected to api")
    })
    .catch((err)=> console.log(err))

