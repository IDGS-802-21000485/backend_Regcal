// models/Receta.js
const mongoose = require('mongoose');

const IngredienteRecetaSchema = new mongoose.Schema({
  ingredienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingrediente' },
  cantidad:      { type: Number, required: true },
  unidad:        { type: String, required: true }, // g, ml, pieza, cucharada
});

const RecetaSchema = new mongoose.Schema({
  usuarioId:   { type: String, required: true },
  nombre:       { type: String, required: true },
  imagen:      { type: String, default: null },

  ingredientes: [IngredienteRecetaSchema],

  nutricional: {
    calories: Number,
    proteins: Number,
    fats:     Number,
    carbs:    Number,
    sugars:   Number,
  },

  fecha: { type: Date, default: () => new Date() },
});

module.exports = mongoose.model('Receta', RecetaSchema);
