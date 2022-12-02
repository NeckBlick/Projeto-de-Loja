require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express()
app.use(express.json())
app.use(cors())
const modelUser =  require('./Models/user')
const modelProduct =  require('./Models/product')

// Buscar produtos
app.get("/products" , async (req, res) => {

    const product = await modelProduct.find()
    res.status(200).json({product})
})

// Register product
app.post("/product/register", async (req, res) => {
    const image = req.file
    const { title, description, price} = req.body
    // Validação
    if(!title){
        return res.status(422).json({msg: "O titulo é obrigatório!"})
    }
    if(!description){
        return res.status(422).json({msg: "A descrição é obrigatória!"})
    }
    if(!price){
        return res.status(422).json({msg: "O preço é obrigatório!"})
    }
    // if(!image){
    //     return res.status(422).json({msg: "A imagem é obrigatória!"})
    // }
    // Checar se existe o produto
    const productExist = await modelProduct.findOne({title: title, description: description})
    if(productExist){
        return res.status(422).json({msg: "Esse produto já está cadastrado!"})
    }

    // Criar o usuário
    const product = new modelProduct({
        title,
        description,
        price, 
        image
    })

    try{

        await product.save()
        res.status(201).json({msg: "Produto cadastrado com sucesso!"})

    }catch(err){
        console.log(err)
        res.status(500).json({msg: "Houve um erro no servidor, tente novamente mais tarde!"})
    }
})

function checkToken(req, res, next){
    const authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(" ")[1]

    if(!token){
        return res.status(401).json({msg: "Acesso negado"})
    }

    try{
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
        
    }catch(err){
        console.log(err)
        res.status(400).json({msg: "Token invalido!"})
    }
}
// Usuários
app.get("/users" , async (req, res) => {

    // Ver se existe o usuário
    const user = await modelUser.find()
    res.status(200).json({user})
})

// Usuário pelo id
app.get("/user/:id" , checkToken , async (req, res) => {
    const id = req.params.id
    // Ver se existe o usuário
    const user = await modelUser.findById(id)
    if(!user){
        return res.status(200).json({msg: "Usuario não encontrado!"})
    }
    res.status(200).json({user})
})

// Editar usuário 
app.put("/user/:id" , checkToken , async (req, res) => {
    const id = req.params.id
    const { nome, email, senha, confirmsenha } = req.body
    if(!nome){
        return res.status(422).json({msg: "O nome é obrigatorio!"})
    }
    if(!email){
        return res.status(422).json({msg: "O email é obrigatorio!"})
    }
    if(!senha){
        return res.status(422).json({msg: "A senha é obrigatorio!"})
    }
    if(senha != confirmsenha){
        return res.status(422).json({msg: "As senhas são diferentes!"})
    }

    const salt = await bcrypt.genSalt(12)
    const hashSenha = await bcrypt.hash(senha, salt)
    try{

        await modelUser.findByIdAndUpdate({_id: id},{
            nome: nome,
            email: email,
            senha: hashSenha
        })
        res.status(201).json({msg: "Usuario editado com sucesso!"})

    }catch(err){
        console.log(err)
        res.status(500).json({msg: "Houve um erro no servidor, tente novamente mais tarde!"})
    }
    
})



// Register Route
app.post("/auth/register", async (req, res) => {

    const { nome, email, senha, confirmsenha } = req.body
    // Validação
    if(!nome){
        return res.status(422).json({msg: "O nome é obrigatorio!"})
    }
    if(!email){
        return res.status(422).json({msg: "O email é obrigatorio!"})
    }
    if(!senha){
        return res.status(422).json({msg: "A senha é obrigatorio!"})
    }
    if(senha != confirmsenha){
        return res.status(422).json({msg: "As senhas são diferentes!"})
    }
    // Checar se existe o usuário
    const userExist = await modelUser.findOne({email: email})
    if(userExist){
        return res.status(422).json({msg: "Por favor, utilize outro e-mail!"})
    }
    // Criar a senha
    const salt = await bcrypt.genSalt(12)
    const hashSenha = await bcrypt.hash(senha, salt)

    // Criar o usuário
    const User = new modelUser({
        nome,
        email,
        senha: hashSenha
    })

    try{
        await User.save()
        res.status(201).json({msg: "Usuario cadastrado com sucesso!"})

    }catch(err){
        console.log(err)
        res.status(500).json({msg: "Houve um erro no servidor, tente novamente mais tarde!"})
    }
})

// Login usuário
app.post("/auth/login", async (req, res) => {
    const { email, senha } = req.body
    // Validação 
    if(!email){
        return res.status(200).json({msg: "O email é obrigatorio!"})
    }
    if(!senha){
        return res.status(200).json({msg: "A senha é obrigatorio!"})
    }
    // Ver se existe o usuário
    const user = await modelUser.findOne({email: email})
    if(!user){
        return res.status(200).json({msg: "Usuário ou senha invalida!"})
    }
    // Ver se a senha está certa
    const checkSenha = await bcrypt.compare(senha, user.senha)
    if(!checkSenha){
        return res.status(200).json({msg: "Usuário ou senha invalida!"})
    }

    try{
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id,
        }, secret)
        
        res.status(200).json({msg:"Usuário logado com sucesso", token, user})
    }catch(err){
        console.log(err)
        res.status(500).json({msg: "Houve um erro no servidor, tente novamente mais tarde!"})
    }
})

// Credenciais
const DB_USER = process.env.DB_USER
const DB_PASS = process.env.DB_PASS
mongoose
.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@ecomerce.vlpd9f2.mongodb.net/?retryWrites=true&w=majority`)
.then(() => {
    console.log("Conectado com o banco")
    app.listen(3001, () => {
        console.log("Running...")
    })
}).catch(err => console.log(err))

