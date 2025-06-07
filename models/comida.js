const mongoose = require('mongoose');

const NutrientesSchema = new mongoose.Schema({
  calories:   { type: Number, required: true },
  proteins:   { type: Number, required: true },
  fats:       { type: Number, required: true },
  carbs:      { type: Number, required: true },
  sugars:     { type: Number, required: true },
});

const ComidaSchema = new mongoose.Schema({
  usuarioId:     { type: String, required: true },
  fecha:         { type: String, required: true }, // "YYYY-MM-DD"
  title:         { type: String, required: true },
  ingredientes:  { type: [String], required: true },
  foto:          { type: String, default: null },  // base64
  nutricional:   { type: NutrientesSchema, required: true },
  calorias:      { type: Number, required: true },
  fechaConsulta: { type: Date, default: () => new Date() },
});

module.exports = mongoose.model('Comida', ComidaSchema);
