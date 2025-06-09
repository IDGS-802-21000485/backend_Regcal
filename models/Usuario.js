const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  estatura: { type: Number, required: true }, // en cm
  peso: { type: Number, required: true }, // en kg
  actividad: { type: String, enum: ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'], required: true },
  objetivo: { type: String, enum: ['ligero', 'pesado'], required: true },
  caloriasMantenimiento: { type: Number, required: true },
  caloriasObjetivo: { type: Number, required: true }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
