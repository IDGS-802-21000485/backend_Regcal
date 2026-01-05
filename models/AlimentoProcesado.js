const mongoose = require('mongoose');

const NutrientesSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  proteins: { type: Number, required: true },
  fats:     { type: Number, required: true },
  carbs:    { type: Number, required: true },
  sugars:   { type: Number, required: true },
});

const AlimentoProcesadoSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  nombre:    { type: String, required: true },
  marca:     { type: String },
  porcion:   { type: String, default: '1 pieza' }, // texto libre
  peso:      { type: Number }, // gramos o ml (opcional)
  foto:      { type: String, default: null },
  nutricional: NutrientesSchema,
  creadoEn:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlimentoProcesado', AlimentoProcesadoSchema);
