const mongoose = require('mongoose');

const NutrientesSchema = new mongoose.Schema({
  calories:  { type: Number, required: true }, // kcal por 100g
  proteins:  { type: Number, required: true }, // g por 100g
  fats:      { type: Number, required: true }, // g por 100g
  carbs:     { type: Number, required: true }, // g por 100g
  sugars:    { type: Number, required: true }, // g por 100g
});

const IngredienteSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  nombre:    { type: String, required: true },
  foto:      { type: String }, // base64 o URL
  nutricional: {
    type: NutrientesSchema,
    required: true
  },
  unidadBase: {
    type: String,
    default: '100g'
  },
  fechaCreacion: {
    type: Date,
    default: () => new Date()
  }
});

module.exports = mongoose.model('Ingrediente', IngredienteSchema);
