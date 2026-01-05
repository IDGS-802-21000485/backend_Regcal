const express = require('express');
const Alimento = require('../models/AlimentoProcesado');
const router = express.Router();

// Crear
router.post('/', async (req, res) => {
  try {
    const alimento = await Alimento.create(req.body);
    res.json(alimento);
  } catch (err) {
    res.status(400).json({ mensaje: 'Error al crear alimento' });
  }
});

// Obtener por usuario
router.get('/', async (req, res) => {
  const { usuarioId } = req.query;
  const alimentos = await Alimento.find({ usuarioId });
  res.json(alimentos);
});

// Eliminar
router.delete('/:id', async (req, res) => {
  await Alimento.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Eliminado' });
});

module.exports = router;
