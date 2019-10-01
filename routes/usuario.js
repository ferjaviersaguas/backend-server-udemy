var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autentication');
var app = express();




var Usuario = require('../models/usuario');


// ================================
// Obtener todos los usuarios
// ================================

//Rutas
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde) //Agarrar los siguientes 5
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }


                // http://localhost:3000/usuario?desde=10 los siguientes 10
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                });

            });

});





// ================================
// Crear un nuevo usuario
// ================================

app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({

        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role

    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
                //El mismo req.usuario en autenticacion.js
        });

    });
});

// ================================
// Actualizar usuario
// ================================

app.put('/:id', mdAutenticacion.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un usuario',
                errors: err
            });
        }

        if (!usuario) {
            res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ';-)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        })

    });

});

// ================================
// Borrar usuario por id
// ================================

app.delete('/:id', mdAutenticacion.verifyToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario con ese ID:' + id,
                errors: { message: 'No existe el usuario' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });


    })

})

module.exports = app;