const express = require("express");
const Receta = require("../models/Receta");
const Ingrediente = require("../models/Ingrediente");
const calcularTotales = require("../utils/calcularReceta");

const router = express.Router();

// Crear receta
router.post("/", async (req, res) => {
  const { usuarioId, nombre, imagen, ingredientes } = req.body;

  try {
    const ingredientesDB = await Ingrediente.find({
      _id: { $in: ingredientes.map((i) => i.ingredienteId) },
    });

    const nutricional = calcularTotales(ingredientes, ingredientesDB);

    const receta = await Receta.create({
      usuarioId,
      nombre,
      imagen,
      ingredientes,
      nutricional,
      calorias: nutricional.calories,
    });

    res.json(receta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear receta" });
  }
});

// GET /api/recetas?usuarioId=usuario123
router.get("/", async (req, res) => {
  const { usuarioId } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ mensaje: "usuarioId es requerido" });
  }

  try {
    const recetas = await Receta.find({ usuarioId }).sort({ createdAt: -1 });
    res.json(recetas);
  } catch (err) {
    console.error("❌ Error al obtener recetas:", err.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// DELETE /api/recetas/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!receta) {
      return res.status(404).json({ mensaje: "Receta no encontrada" });
    }
    const receta = await Receta.findByIdAndDelete(req.params.id);

    res.json({ mensaje: "Receta eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar receta:", error.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

module.exports = router;
