// routes/registros.js
const express = require('express');
const axios   = require('axios');
const Registro = require('../models/Registro');
require('dotenv').config();

const router = express.Router();

// Auxiliar: suma un nutriente clave ('ENERC_KCAL', 'PROCNT', 'FAT', 'CHOCDF', 'SUGAR') en el arreglo de detalles
function sumarNutriente(detalles, key) {
  return detalles.reduce((acc, item) => {
    const parsed0 = item.parsed?.[0];
    if (!parsed0 || !parsed0.nutrients || !parsed0.nutrients[key]) return acc;
    return acc + (parsed0.nutrients[key].quantity || 0);
  }, 0);
}

/**
 * POST /api/registros
 * Body esperado:
 * {
 *   usuarioId: "string",
 *   fecha: "YYYY-MM-DD",
 *   title: "Nombre de la receta",
 *   ingredientes: [ "2 pechugas de pollo cocidas", "1 taza de lechuga picada", ... ],
 *   foto: "https://mi-servidor.com/imagen123.jpg"   // (opcional)
 * }
 */
router.post('/', async (req, res) => {
  const { usuarioId, fecha, title, ingredientes, foto } = req.body;

  // Validaciones básicas:
  if (!usuarioId || !fecha || !title || !Array.isArray(ingredientes) || ingredientes.length === 0) {
    return res.status(400).json({
      mensaje: 'Debe enviar usuarioId, fecha (YYYY-MM-DD), title y un arreglo non‐empty de ingredientes.'
    });
  }

  try {
    // 1) Llamar a Edamam Nutrition Analysis (POST /api/nutrition-details)
    const edamamUrl = `https://api.edamam.com/api/nutrition-details?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;

    const edamamResponse = await axios.post(
      edamamUrl,
      {
        title: title,
        ingr:  ingredientes
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const edData = edamamResponse.data;
    const detalles = edData.ingredients || [];

    // 2) Sumar cada nutriente de todos los ingredientes
    const totalCalorias       = sumarNutriente(detalles, 'ENERC_KCAL');
    const totalProteinas      = sumarNutriente(detalles, 'PROCNT');
    const totalGrasas         = sumarNutriente(detalles, 'FAT');
    const totalCarbohidratos  = sumarNutriente(detalles, 'CHOCDF');
    const totalAzucares       = sumarNutriente(detalles, 'SUGAR');

    // Preparar el objeto "nuevaComida" para guardar en Mongo:
    const nuevaComida = {
      title,
      ingredientes,
      foto: foto || null,
      nutricional: {
        calories:   totalCalorias,
        proteins:   totalProteinas,
        fats:       totalGrasas,
        carbs:      totalCarbohidratos,
        sugars:     totalAzucares,
      },
      calorias: totalCalorias,
      fechaConsulta: new Date(), // timestamp de ahora
    };

    // 3) Guardar en Mongo: buscar registro diario (usuarioId + fecha)
    let registro = await Registro.findOne({ usuarioId, fecha });
    if (registro) {
      // Si ya existe, agregamos esta comida al arreglo
      registro.comidas.push(nuevaComida);
      await registro.save();
    } else {
      // Si no existe documento para ese día, creamos uno nuevo
      registro = new Registro({
        usuarioId,
        fecha,
        comidas: [nuevaComida]
      });
      await registro.save();
    }

    // 4) Calcular total de calorías consumidas durante el día (tras haber agregado):
    const sumaDiaria = registro.comidas
      .map((c) => c.calorias)
      .reduce((acc, x) => acc + x, 0);

    // 5) Devolver JSON de respuesta con:
    //    - detalles de esta comida analizada
    //    - sumaDiaria de calorías
    return res.json({
      mensaje: 'Comida analizada y guardada correctamente',
      comida: {
        title:          nuevaComida.title,
        ingredientes:   nuevaComida.ingredientes,
        foto:           nuevaComida.foto,
        nutricional: {
          calories:   `${nuevaComida.nutricional.calories.toFixed(2)} kcal`,
          proteins:   `${nuevaComida.nutricional.proteins.toFixed(2)} g`,
          fats:       `${nuevaComida.nutricional.fats.toFixed(2)} g`,
          carbs:      `${nuevaComida.nutricional.carbs.toFixed(2)} g`,
          sugars:     `${nuevaComida.nutricional.sugars.toFixed(2)} g`,
        },
        calorias: `${nuevaComida.calorias.toFixed(2)} kcal`,
      },
      totalCaloriasDia: `${sumaDiaria.toFixed(2)} kcal`
    });
  } catch (error) {
    console.error('❌ Error al procesar /api/registros:', error.response?.data || error.message);
    return res.status(500).json({ mensaje: 'Error al consultar la API de nutrición o guardar en BD.' });
  }
});

module.exports = router;
