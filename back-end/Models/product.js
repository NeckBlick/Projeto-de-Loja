const mongoose = require('mongoose')

const product = mongoose.model("product", {
    image:{
        data: Buffer,
        contentType: String
    },
    title: String,
    description: String,
    price: String,
})

module.exports = product