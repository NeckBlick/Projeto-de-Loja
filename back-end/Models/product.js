const mongoose = require('mongoose')
const Schema = mongoose.Schema

const product = mongoose.model("product", {
    titulo: String,
    descricao: String,
    preco: String
})

module.exports = product