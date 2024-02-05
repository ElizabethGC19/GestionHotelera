const mongoose = require("mongoose");
let incidenciasSchema = new mongoose.Schema ({
    descripcion: {
        type: String,
        required: [true, 'La descripción de la incidencia es obligatoria']
    },
    fechaInicio: {
        type: Date,
        required: true,
        default: new Date()
    },
    fechaFin: {
        type: Date
    },
    imagen: {
        type: String,
        required: false
    }
});

let habitacionSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: [true, 'El número de la habitación es obligatorio'],
        min: [1, 'El número de la habitación no puede ser menor que 1'],
        max: [100, 'El número de la habitación no puede ser mayor de 100']
    },
    tipo: {
        type: String,
        enum: ["individual", "doble", "familiar", "suite"]
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción para la habitación es obligatoria'],
        trim: true
    },
    ultimaLimpieza: {
        type: Date,
        required: true,
        default: new Date()
    },
    precio: {
        type: Number,
        required: [250, 'El precio de la habitación es obligatorio'],
        min: [0, 'El precio no puede ser menor que 0€'],
        max: [250, 'El precio no puede ser mayor de 250€']
    },
    incidencias: [incidenciasSchema],
    imagen: {
        type: String,
        required: false
    }
});
let Habitacion = mongoose.model("habitaciones", habitacionSchema);
module.exports = Habitacion;