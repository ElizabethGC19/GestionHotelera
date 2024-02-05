const express = require("express");
const Limpieza = require(__dirname + "/../models/limpieza");
const Habitacion = require(__dirname + "/../models/habitacion");
const auth = require(__dirname + "/auth");
const router = express.Router();
let autenticacion = (req, res, next) => {
    if (req.session && req.session.login)
        return next();
    else
        res.render('login');
};
router.get('/:id', (req, res) => {
    Limpieza.find({idHabitacion: req.params['id']}).sort("-fechaHora").then(resultado => {
            Habitacion.findById(req.params['id']).then((habitacion) => {
                res.render('limpiezas_listado', { limpiezas: resultado, habitacion: habitacion });
            }).catch(() => {
                res.render('error', { error: 'Error encontrando habitación' });
            });
    }).catch(() => {
        res.render('error', { error: 'Error buscando limpiezas' });
    });
});

router.get('/nueva/:id', autenticacion, (req, res) => {
    Limpieza.find({ idHabitacion: req.params['id']}).populate("idHabitacion").then(() => {
        Habitacion.findById(req.params['id']).then((habitacion) => {
            res.render('limpiezas_nueva', {fechaActual: new Date(), habitacion: habitacion });
        }).catch(() => {
            res.render('error', { error: 'Error encontrando habitación' });
        });

    }).catch(() => {
        res.render('error', {error: "Error encontrando limpiezas"});
    });
});


router.post('/:id', autenticacion, (req, res) => {
    let nuevaLimpieza = new Limpieza({
        idHabitacion: req.params.id,
        fechaHora: req.body.fechaHora,
        observaciones: req.body.observaciones,
    });
    nuevaLimpieza.save().then(() => {
        res.redirect('/limpiezas/' + req.params.id);
    }).catch(() => {
        res.render('error', {error: "Error añadiendo la limpieza"});
    });
});

module.exports = router;