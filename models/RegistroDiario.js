const mongoose = require('mongoose');

const RegistroDiarioSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  fecha:     { type: String, required: true },
  comidas:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comida' }],
});

module.exports = mongoose.model('RegistroDiario', RegistroDiarioSchema);
