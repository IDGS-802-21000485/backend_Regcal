// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas
const nutricionRoutes = require('./routes/nutricionRoutes');
const comidasRoutes   = require('./routes/comidas');
const registroRoutes  = require('./routes/registros'); // opcional, si aún la usas
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);
app.use('/api/nutricion', nutricionRoutes);
app.use('/api/comidas',   comidasRoutes);
app.use('/api/registros',  registroRoutes);

mongoose
  .connect(process.env.MONGO_URI) // ya no hace falta pasar useNewUrlParser o useUnifiedTopology
  .then(() => console.log('🔗 Conectado a MongoDB'))
  .catch((error) => console.log('❌ Error al conectar a MongoDB:', error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
