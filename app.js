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
        password
})

try {

} catch(error){
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

