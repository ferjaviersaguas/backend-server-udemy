var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ================================
// Verificar token
// ================================

exports.verifyToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        //El mismo req.usuario en usuario.js
        req.usuario = decoded.usuario;

        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });

    });

}