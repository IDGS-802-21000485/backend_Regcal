const express = require('express');
const Ingrediente = require('../models/Ingrediente');

const router = express.Router();

// Crear ingrediente
router.post('/', async (req, res) => {
  try {
    const ingrediente = await Ingrediente.create(req.body);
    res.json(ingrediente);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear ingrediente' });
  }
});

// Obtener ingredientes por usuario
router.get('/:usuarioId', async (req, res) => {
  const ingredientes = await Ingrediente.find({ usuarioId: req.params.usuarioId });
  res.json(ingredientes);
});

module.exports = router;
