var express = require('express');

var app = express();

var fileUpload = require('express-fileupload');
var fs = require('fs');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options
app.use(fileUpload());

//Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es válida',
            errors: { message: 'Tipo de coleccion no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'La extension validas son ' + extensionesValidas.join(', ') }
        });
    }


    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;


    // Mover el archivo temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    //mv -> mover
    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extension: extension
        // });


    });
});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    var path = '';

    // ==============================================================
    //  Actualizacion de la BD y carga de imagen para usuario
    // ==============================================================

    if (tipo === 'usuarios') {

        Usuario.findById(id, (error, usuario) => {

            // Si no existe usuario mandar mensaje

            if (!usuario) {

                return res.status(400).json({

                    ok: false,
                    mensaje: 'El usuario con el id ' + id + ' no existe',
                    errors: { message: 'No existe un usuario con ese ID' }

                });

            }

            // Validar si el usuario ya cuenta con una imagen para poder eliminarla

            if (usuario.img !== undefined && usuario.img.length > 0) {

                path = './uploads/usuarios/' + usuario.img;

                // Si existe,  elimina la imagen anterior

                if (fs.existsSync(path)) {

                    fs.unlink(path, (error) => {

                        if (error) {

                            return res.status(400).json({

                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen',
                                errors: error

                            });
                        }
                    });
                }
            }

            // Actualizar la BD

            usuario.img = nombreArchivo;
            usuario.save((error, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({

                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado

                });
            })
        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            // Si no existe el medico 
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'El Médico' + id + 'no existe',
                    errors: { message: 'Médico no existe' }
                });
            }

            // Validar si el medico tiene una imagen para poder eliminarla

            if (medico.img !== undefined && medico.img.length > 0) {

                var path = './uploads/medicos/' + medico.img;

                // Si existe, elimina la imagen anterior

                if (fs.existsSync(path)) {
                    fs.unlink(path, (error) => {

                        if (error) {

                            return res.status(400).json({

                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen',
                                errors: error

                            });
                        }
                    });
                }
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    usuario: medicoActualizado
                });

            })

        });
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (error, hospital) => {

            // Si no existe el hospital

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            // Validar si el hospital tiene una imagen para poder eliminarla

            if (hospital.img !== undefined && hospital.img.length > 0) {

                var path = './uploads/hospitales/' + hospital.img;

                // Si existe, elimina la imagen anterior
                if (fs.existsSync(path)) {
                    fs.unlink(path, (error) => {

                        if (error) {
                            return res.status(400).json({

                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen',
                                errors: error

                            });
                        }
                    });
                }

            }


            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    usuario: hospitalActualizado
                });

            })

        });
    }


}

module.exports = app;