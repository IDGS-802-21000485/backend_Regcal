// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// ====================
// Importar rutas
// ====================
const authRoutes        = require('./routes/auth');
const nutricionRoutes   = require('./routes/nutricionRoutes');
const comidasRoutes     = require('./routes/comidas');
const registroRoutes    = require('./routes/registros');

// 👉 NUEVAS RUTAS
const ingredientesRoutes = require('./routes/ingredientes');
const recetasRoutes      = require('./routes/recetas');
const alimentosProcesadosRoutes = require('./routes/alimentosProcesados');

// ====================
// Usar rutas
// ====================
app.use('/api/auth', authRoutes);
app.use('/api/nutricion', nutricionRoutes);
app.use('/api/comidas', comidasRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/alimentos-procesados', alimentosProcesadosRoutes);

// 🥕 Ingredientes manuales
app.use('/api/ingredientes', ingredientesRoutes);

// 🍳 Recetas calculadas
app.use('/api/recetas', recetasRoutes);

// ====================
// Conexión MongoDB
// ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('🔗 Conectado a MongoDB'))
  .catch((error) =>
    console.error('❌ Error al conectar a MongoDB:', error)
  );

// ====================
// Servidor
// ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
