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

// GET /api/ingredientes?usuarioId=usuario123
router.get("/", async (req, res) => {
  const { usuarioId } = req.query;

  if (!usuarioId) {
    return res
      .status(400)
      .json({ mensaje: "usuarioId es requerido" });
  }

  try {
    const ingredientes = await Ingrediente.find({ usuarioId });
    res.json(ingredientes);
  } catch (err) {
    console.error("❌ Error al consultar ingredientes:", err.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});


module.exports = router;
