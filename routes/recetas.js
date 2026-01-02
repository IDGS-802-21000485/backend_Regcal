const express = require('express');
const Receta = require('../models/Receta');
const Ingrediente = require('../models/Ingrediente');
const calcularTotales = require('../utils/calcularReceta');

const router = express.Router();

// Crear receta
router.post('/', async (req, res) => {
  const { usuarioId, title, foto, ingredientes } = req.body;

  try {
    const ingredientesDB = await Ingrediente.find({
      _id: { $in: ingredientes.map(i => i.ingredienteId) }
    });

    const nutricional = calcularTotales(ingredientes, ingredientesDB);

    const receta = await Receta.create({
      usuarioId,
      title,
      foto,
      ingredientes,
      nutricional,
      calorias: nutricional.calories
    });

    res.json(receta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear receta' });
  }
});

// Obtener recetas por usuario
router.get('/:usuarioId', async (req, res) => {
  const recetas = await Receta.find({ usuarioId: req.params.usuarioId });
  res.json(recetas);
});

module.exports = router;
