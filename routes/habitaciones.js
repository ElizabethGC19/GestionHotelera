const express = require("express");
const multer = require('multer');
const Habitacion = require(__dirname + "/../models/habitacion");
const Limpieza = require(__dirname + "/../models/limpieza");
const router = express.Router();

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/habitaciones')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname)
    }
});
let autenticacion = (req, res, next) => {
    if (req.session && req.session.login)
        return next();
    else
        res.render('login');
};

let upload = multer({ storage: storage });

// Actualizar TODAS las últimas limpiezas 

router.put("/ultimaLimpieza", async (req, res) => {
    try {
        const habitaciones = await Habitacion.find();
        const resultado = [];
        for (const habitacion of habitaciones) {
            const resultadoLimpieza = await Limpieza.find({ idHabitacion: habitacion.id }).sort("-fechaHora").select("fechaHora").limit(1);

            if (resultadoLimpieza[0] && resultadoLimpieza[0].fechaHora !== undefined) {
                const habitacionActualizada = await Habitacion.findByIdAndUpdate(habitacion.id, {
                    $set: {
                        ultimaLimpieza: resultadoLimpieza[0].fechaHora
                    }
                }, { new: true });

                if (habitacionActualizada)
                    resultado.push(habitacionActualizada);
                else
                    res.status(400).send({ error: "Error actualizando los datos de la habitación" });
            }
        }
        res.status(200).send({ resultado: resultado });

    } catch (error) {
        res.status(400).send({ error: "Error actualizando limpiezas" });
    }
});

router.get('/', (req, res) => {
    Habitacion.find().then(resultado => {
        res.render('habitaciones_listado', { habitaciones: resultado });
    }).catch(() => {
        res.render('error', { error: 'Error obteniendo habitaciones' });
    });
});

router.get('/nueva', autenticacion, (req, res) => {
    res.render('habitaciones_nueva');
});

router.get('/:id', (req, res) => {
    Habitacion.findById(req.params['id']).then(resultado => {
        if (resultado)
            res.render('habitaciones_ficha', { habitacion: resultado });
        else
            res.render('error', { error: 'La habitación seleccionada no existe' });
    }).catch(() => {
        res.render('error', { error: 'Error buscando habitación' });
    });
});

router.post('/', upload.single('imagen'), (req, res) => {
    if (req.file) {
        imagen = req.file.filename;
    } else {
        imagen = null;
    }
    let nuevaHabitacion = new Habitacion({
        numero: req.body.numero,
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        ultimaLimpieza: new Date(),
        precio: req.body.precio,
        imagen: imagen
    });
    nuevaHabitacion.save().then(() => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        let errores = {
            general: "Error guardando habitación"
        };
        if (error.errors.numero) {
            errores.numero = error.errors.numero.message;
        }
        if (error.errors.precio) {
            errores.precio = error.errors.precio.message;
        }
        if (error.errors.descripcion) {
            errores.descripcion = error.errors.descripcion.message;
        }
        res.render('habitaciones_nueva', { errores: errores, datos: req.body });
    });
});
// EDITAR UNA HABITACION
router.get('/:id/editar', autenticacion,(req, res) => {
    Habitacion.findById(req.params['id']).then(habitacion => {
        if (habitacion) {
            res.render('habitaciones_edicion', {habitacion: habitacion});
        } else {
            res.render('error', {error: "Habitacion no encontrada"});
        }
    }).catch(() => {
        res.render('error', {error: "Habitacion no encontrada"});
    });
});

router.post('/:id', autenticacion, upload.single('imagen'), (req, res) => {
    Habitacion.findById(req.params.id).then((habitacion) => {
        if (habitacion) {
            habitacion.numero = req.body.numero;
            habitacion.tipo = req.body.tipo;
            habitacion.descripcion = req.body.descripcion;
            habitacion.precio = req.body.precio;
            if (req.file) {
                habitacion.imagen = req.file.filename;
            } else {
                habitacion.imagen = null;
            }
            habitacion.save().then(() => {
                res.redirect(req.baseUrl);
            });
        }
    }).catch(() => {
        res.render('error', {error: "Error modificando libro"});
    });
});

router.delete("/:id", autenticacion, (req, res) => {

    Habitacion.findByIdAndRemove(req.params['id'])
    .then(() => {
        Limpieza.find({ idHabitacion: req.params['id'] }).then(limpiezas => {
            limpiezas.forEach(limpieza => {
                Limpieza.findByIdAndRemove(limpieza._id).then();
            });
        });
        res.redirect(req.baseUrl);
    }).catch(() => {
        res.render({ error: "Error eliminando la habitación" });
    });
});
let storageIncidencias = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/incidencias')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname)
    }
});

let uploadIncidencias = multer({ storage: storageIncidencias });

router.post("/:id/incidencias", autenticacion, uploadIncidencias.single('imagen'), (req, res) => {
    if (req.file) {
        imagen = req.file.filename;
    } else {
        imagen = null;
    }
    const nuevaIncidencia = { descripcion: req.body.descripcion, imagen: imagen };
    Habitacion.findById(req.params['id']).then(habitacion => {
        if (nuevaIncidencia.descripcion) {

            if (isNaN(nuevaIncidencia.descripcion)) {
                habitacion.incidencias.push(nuevaIncidencia);
                habitacion.save().then(() => {
                    res.redirect(req.baseUrl + "/" + req.params['id']);
                }).catch((error) => {
                    let errores = {
                        general: "Error guardando la incidencia"
                    };
                    if (error.errors.descripcion) {
                        errores.descripcion = error.errors.descripcion.message;
                    }
                    res.render('habitaciones_ficha', { errores: errores, datos: req.body });
                });
            }
            else
                res.render('error', { error: "La descripción no puede ser  numérica" });
        }
        else
            res.render('error', { error: "La descripción es obligatoria" });
    }).catch(() => {
        res.status(400)
            .send({ error: "Error añadiendo la incidencia" });
    });

});


// Actualizar el estado de una incidencia de una habitación
router.put("/:idH/incidencias/:idI", autenticacion, (req, res) => {
    Habitacion.findById(req.params['idH']).then(habitacion => {
        const incidencia = habitacion.incidencias.id(req.params['idI']);
        if (incidencia) {
            incidencia.fechaFin = new Date();
            habitacion.save();
            res.redirect(req.baseUrl + "/" + req.params['idH']);
        } else {
            res.render('error', { error: "Incidencia no encontrada" });
        }
    }).catch(() => {
        res.status(400).send({ error: "Habitación no encontrada" });
    });
});

module.exports = router;