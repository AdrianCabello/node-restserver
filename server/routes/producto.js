const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');


// ================================
//  Obtener todos los productos
// ================================

app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;

    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .sort('nombre')
        .populate('usuario')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            Producto.count({}, (err, cantidad) => {
                res.json({
                    ok: true,
                    productos,
                    desde: desde,
                    total: cantidad
                })
            })
        })
})

// ================================
//  Obtener 1 por ID
// ================================

app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario')
        .populate('categoria')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No existe el producto'
                    }
                })
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        })

})

// ================================
//  Buscar productos
// ================================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })

        })
})


// ================================
//  Crear un producto
// ================================

app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

// ================================
//  Actualizar un producto
// ================================

app.put('/producto/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let updateProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        disponible: body.disponible,
        descripcion: body.descripcion
    }

    Producto.findOneAndUpdate(id, updateProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

// ================================
//  Borrar un producto
// ================================

app.delete('/producto/:id', (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado
        });

    });
})

module.exports = app;