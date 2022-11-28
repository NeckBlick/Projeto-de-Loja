const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = mongoose.model("user", {
    nome: String,
    email: String,
    senha: String
})

module.exports = User