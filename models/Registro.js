// models/Registro.js
const mongoose = require('mongoose');

const NutrientesSchema = new mongoose.Schema({
  calories:    { type: Number, required: true },   // ENERC_KCAL
  proteins:    { type: Number, required: true },   // PROCNT
  fats:        { type: Number, required: true },   // FAT
  carbs:       { type: Number, required: true },   // CHOCDF
  sugars:      { type: Number, required: true },   // SUGAR
});

const ComidaSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  ingredientes:  { type: [String], required: true },
  foto:          { type: String },                // Puede ser URL o base64
  nutricional:   { type: NutrientesSchema, required: true },
  calorias:      { type: Number, required: true },// redundante para consulta rápida
  fechaConsulta: { type: Date, default: () => new Date() },
});

const RegistroSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  fecha:     { type: String, required: true }, // "YYYY-MM-DD"
  comidas:   { type: [ComidaSchema], default: [] },
});

module.exports = mongoose.model('Registro', RegistroSchema);
