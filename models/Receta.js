const mongoose = require('mongoose');

const NutrientesSchema = new mongoose.Schema({
  calories: Number,
  proteins: Number,
  fats:     Number,
  carbs:    Number,
  sugars:   Number,
});

const RecetaSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  title:     { type: String, required: true },
  foto:      { type: String },

  ingredientes: [
    {
      ingredienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingrediente' },
      nombre: String,
      gramos: Number
    }
  ],

  nutricional: NutrientesSchema,
  calorias: Number,

  fechaCreacion: {
    type: Date,
    default: () => new Date()
  }
});

module.exports = mongoose.model('Receta', RecetaSchema);
