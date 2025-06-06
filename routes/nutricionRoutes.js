const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.post('/calorias', async (req, res) => {
  const { alimento } = req.body;

  if (
    !alimento ||
    !Array.isArray(alimento) ||
    alimento.length === 0
  ) {
    return res.status(400).json({
      mensaje: 'El campo "alimento" debe ser un arreglo con al menos un ingrediente.',
    });
  }

  try {
    const response = await axios.post(
      `https://api.edamam.com/api/nutrition-details?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`,
      {
        title: 'Receta personalizada',
        ingr: alimento,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data;
    const detalles = data.ingredients || [];

    // Función auxiliar que suma un nutriente dado su key (ej. 'ENERC_KCAL', 'PROCNT', etc.)
    const sumar = (key) => {
      return detalles.reduce((total, item) => {
        const parsed0 = item.parsed?.[0];
        if (!parsed0 || !parsed0.nutrients || typeof parsed0.nutrients[key] === 'undefined') {
          return total;
        }
        return total + (parsed0.nutrients[key].quantity || 0);
      }, 0);
    };

    // Calculamos total de cada macronutriente
    const totalCalorias = sumar('ENERC_KCAL');
    const totalProteinas = sumar('PROCNT');
    const totalGrasas = sumar('FAT');
    const totalCarbohidratos = sumar('CHOCDF');
    const totalAzucares = sumar('SUGAR');

    res.json({
      receta: data.title,
      calorias: `${totalCalorias.toFixed(2)} kcal`,
      proteinas: `${totalProteinas.toFixed(2)} g`,
      grasas: `${totalGrasas.toFixed(2)} g`,
      carbohidratos: `${totalCarbohidratos.toFixed(2)} g`,
      azucares: `${totalAzucares.toFixed(2)} g`,
      detalles: detalles.map((item) => ({
        texto: item.text,
        parsed: item.parsed?.[0] || null,
      })),
    });
  } catch (error) {
    console.error(
      '❌ Error al obtener calorías:',
      error.response?.data || error.message
    );
    res.status(500).json({ mensaje: 'Error al consultar la API de nutrición.' });
  }
});

module.exports = router;
