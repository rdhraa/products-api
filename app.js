const express  = require('express')
const mongoose  = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cors = require('cors')

const app = express()
const port = 4000
const secretKey="secret123"
app.use(express.json())



app.use(cors({
    origin: 'http://localhost:5173',  // Allow requests from the React frontend (port 5173)
  }))



app.get('/',(req,res)=>{
    res.send("from the server")
})

async function main(){
    await mongoose.connect('mongodb+srv://entri_user:Kukku00000@cluster0.odat3.mongodb.net/e48db')

}

main()
.then(()=>console.log("DB connected"))
.catch((error)=>console.log(error))

const Product = require('./model/product')

//token autenticate

const authenticateToken = (req,res,next)=>{
    const token = req.headers['authorization']?.split(' ')[1]
    if(!token) return res.status(401).json({error:"Token not provided" })

        jwt.verify(token,secretKey,(err,user)=>{
            if(err) return res.status(403).json({error:"invalid token",err:err})
            req.user = user
            next()
        })
}


//get all products
app.get('/products',async(req,res)=>{
    try {
        const products = await Product.find()
        res.status(200).json(products)
    } catch (error) {
        res.status(400).json(error)
    }
})

//create a product
app.post('/products',async(req,res)=>{
    try {
        const product=new Product(req.body)
        await product.save()
        res.status(201).json(product)

    } catch (error) {
        res.status(400).json(error)
    }
})


//get by id

app.get('/products/:id',async(req,res)=>{
    try {
        const productId = req.params.id
        const product = await Product.findById
        (productId)
        if(!product){
            return res.status(404).json({message:'product not found'})
        }else{
            res.status(200).json(product)
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

//update product

app.patch('/products/:id',async (req,res)=>{
    try {
        const productId = req.params.id
        const product = await Product.
        findByIdAndUpdate(productId,req.
        body,{new:true})
        res.status(200).json(product)
    } catch (error) {
        res.status(400).json(error)
    }
})

//delete product 

app.delete('/products/:id',async(req,res)=>{
    try {
        const productId=req.params.id
        const product = await Product.findByIdAndDelete(productId)
        if(!product){
            return res.status(404).json({message:'product not found'})
        }else{
            res.status(200).json(product)({message:"product deleted successfully"})
        }

    } catch (error) {
        res.status(400).json(error)
    }
})

//get product count for price greater than input price
app.get('/products/count/:price',async (req,res)=>{
    try{
    const price=Number(req.params.price)
    const productCount = await Product.aggregate([
        {
            $match:{price:{$gt:price}}
        },
        {
            $conut:"productCount"
        }
    ])
    res.status(200).send(productCount)
} catch (error){
    res.status(400).json(error)
}
})
//registration
const User = require('./model/user')
app.post('/user',async(req,res)=>{
    try {
        const saltRounds = 10
        bcrypt.hash(req.body.password, saltRounds,async function(err, hash) {
           if(err){
            console.error('error occured while hashing',err)
            res.status(500).json({error:"internal server error"})
           }
           console.log('password hashed succesfully')//new added line
           var userItem = {
            name:req.body.name,
            email:req.body.email,
            password:hash,
            createdAt:new Date()
        }
        var user = new User(userItem)
        await user.save()
        res.status(201).json(user)
        });
        
        

    } catch (error) {
        console.error('Error occurred while saving user:', error);//new
        res.status(400).json(error);//new
    }
})

//login route
app.post('/login',async(req,res)=>{
    try {
        const {email,password} = req.body

        const user = await User.findOne({email:email})
        if(!user){
            return res.status(500).json({message:"user not found"})
        }
        const isValid =(password==user.password)
        if(!isValid){
            return res.status(500).json({message:"Invalid credentials"})
        }
        //token creation
        let payload = {user:email}
        const secretKey = "secret123"
        let token =jwt.sign(payload,secretKey)
        res.status(200).json({message:"login successfull",token:token})

    } catch (error) {
        
    }res.status(400).json(error)
})

app.listen(port,()=>console.log("server started"))



