const express = require("express");
const router = express.Router();
const Usuario = require(__dirname + "/../models/usuario");
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', (req, res) => {
    Usuario.find({login: req.body.login, password: req.body.password}).then((usuario) => {
        req.session.login = usuario[0].login;
        res.redirect('/habitaciones');
    }).catch(() => {
        res.render('login',
            { error: "Usuario o contraseña incorrectos" });
    });
});
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});
module.exports = router;