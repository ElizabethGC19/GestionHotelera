const mongoose = require("mongoose");
let usuarioSchema = new mongoose.Schema ({
    login: {
        type: String,
        required: true,
        minlenght: 4,
    },
    password: {
        type: String,
        required: true,
        minlenght: 7,
    },
});
let Usuario = mongoose.model("usuarios", usuarioSchema);
module.exports = Usuario;