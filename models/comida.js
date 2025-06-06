// models/Comida.js
const mongoose = require('mongoose');

const NutrientesSchema = new mongoose.Schema({
  calories:   { type: Number, required: true },  // ENERC_KCAL
  proteins:   { type: Number, required: true },  // PROCNT
  fats:       { type: Number, required: true },  // FAT
  carbs:      { type: Number, required: true },  // CHOCDF
  sugars:     { type: Number, required: true },  // SUGAR
});

const ComidaSchema = new mongoose.Schema({
  usuarioId:     { type: String, required: true },   // identificador de usuario
  fecha:         { type: String, required: true },   // "YYYY-MM-DD"
  title:         { type: String, required: true },   // nombre de la receta o comida
  ingredientes:  { type: [String], required: true }, // arreglo de strings
  foto:          { type: String, default: null },    // URL o base64
  nutricional:   { type: NutrientesSchema, required: true },
  calorias:      { type: Number, required: true },   // redundante para consulta rápida
  fechaConsulta: { type: Date, default: () => new Date() },
});

module.exports = mongoose.model('Comida', ComidaSchema);
