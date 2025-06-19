const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  estatura: { type: Number, required: true, min: 100, max: 250 }, // en cm
  peso: { type: Number, required: true, min: 30, max: 300 }, // en kg
  actividad: { 
    type: String, 
    required: true,
    enum: ['sedentario', 'ligero', 'moderado', 'intenso']
  },
  objetivo: {
    type: String,
    required: true,
    enum: ['ligero', 'pesado']
  },
  caloriasMantenimiento: { type: Number },
  caloriasObjetivo: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);