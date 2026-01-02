// models/Ingrediente.js
const mongoose = require('mongoose');

const NutrientesSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  proteins: { type: Number, required: true },
  fats:     { type: Number, required: true },
  carbs:    { type: Number, required: true },
  sugars:   { type: Number, required: true },
});

const IngredienteSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  nombre:    { type: String, required: true },

  // Siempre por 100g o 100ml
  unidadBase: {
    type: String,
    enum: ['g', 'ml'],
    required: true,
  },
  cantidadBase: {
    type: Number,
    default: 100,
  },

  // Para cucharada, pieza, taza, etc
  conversiones: {
    type: Object,
    default: {},
  },

  nutricional: NutrientesSchema,

  imagen: { type: String, default: null },
});

module.exports = mongoose.model('Ingrediente', IngredienteSchema);
