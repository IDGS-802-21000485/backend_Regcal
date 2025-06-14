// backend/routes/comidas.js

const express = require("express");
const axios = require("axios");
const Comida = require("../models/comida");
const RegistroDiario = require("../models/RegistroDiario");
require("dotenv").config();

const router = express.Router();

// Función auxiliar para sumar un nutriente clave en el arreglo de ingredientes
function sumarNutriente(detalles, key) {
  return detalles.reduce((acc, item) => {
    const parsed0 = item.parsed?.[0];
    if (!parsed0 || !parsed0.nutrients || !parsed0.nutrients[key]) return acc;
    return acc + (parsed0.nutrients[key].quantity || 0);
  }, 0);
}

/**
 * POST /api/comidas
 * Body JSON esperado:
 * {
 *   usuarioId:    "string",
 *   fecha:        "YYYY-MM-DD",
 *   title:        "Nombre de la comida o receta",
 *   ingredientes: ["2 cooked chicken breasts", "1 cup chopped lettuce", ...],
 *   foto:         "http://mi-servidor.com/imagen.jpg" // (opcional)
 * }
 */
router.post("/", async (req, res) => {
  const { usuarioId, fecha, title, ingredientes, foto } = req.body;

  // Validación básica
  if (
    !usuarioId ||
    !fecha ||
    !title ||
    !Array.isArray(ingredientes) ||
    ingredientes.length === 0
  ) {
    return res.status(400).json({
      mensaje:
        "Faltan datos. Se requiere usuarioId, fecha (YYYY-MM-DD), title y un arreglo non-empty de ingredientes.",
    });
  }

  try {
    // 1) Llamar a Edamam Nutrition Analysis
    const edamamUrl =
      `https://api.edamam.com/api/nutrition-details` +
      `?app_id=${process.env.EDAMAM_APP_ID}` +
      `&app_key=${process.env.EDAMAM_APP_KEY}`;

    const edamamResponse = await axios.post(
      edamamUrl,
      {
        title: title,
        ingr: ingredientes,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const edData = edamamResponse.data;
    const detalles = edData.ingredients || [];

    // 2) Sumar nutrientes de todos los ingredientes
    const totalCalorias = sumarNutriente(detalles, "ENERC_KCAL");
    const totalProteinas = sumarNutriente(detalles, "PROCNT");
    const totalGrasas = sumarNutriente(detalles, "FAT");
    const totalCarbohidratos = sumarNutriente(detalles, "CHOCDF");
    const totalAzucares = sumarNutriente(detalles, "SUGAR");

    // 3) Crear documento Comida en Mongo
    const nuevaComida = new Comida({
      usuarioId: usuarioId,
      fecha: fecha,
      title: title,
      ingredientes: ingredientes,
      foto: foto || null,
      nutricional: {
        calories: totalCalorias,
        proteins: totalProteinas,
        fats: totalGrasas,
        carbs: totalCarbohidratos,
        sugars: totalAzucares,
      },
      calorias: totalCalorias,
      fechaConsulta: new Date(),
    });

    const comidaGuardada = await nuevaComida.save();

    // 4) Agregar referencia a RegistroDiario(usuarioId, fecha)
    let registro = await RegistroDiario.findOne({ usuarioId, fecha });
    if (registro) {
      registro.comidas.push(comidaGuardada._id);
      await registro.save();
    } else {
      registro = new RegistroDiario({
        usuarioId,
        fecha,
        comidas: [comidaGuardada._id],
      });
      await registro.save();
    }

    // 5) Calcular total de calorías consumidas en el día
    // Reemplazamos execPopulate por sólo await registro.populate(...)
    await registro.populate("comidas");
    const sumaDiaria = registro.comidas.reduce(
      (acc, c) => acc + (c.calorias || 0),
      0
    );

    // 6) Responder con JSON
    return res.json({
      mensaje: "Comida analizada y guardada correctamente.",
      comida: {
        _id: comidaGuardada._id,
        title: comidaGuardada.title,
        ingredientes: comidaGuardada.ingredientes,
        foto: comidaGuardada.foto,
        nutricional: {
          calories: `${comidaGuardada.nutricional.calories.toFixed(2)} kcal`,
          proteins: `${comidaGuardada.nutricional.proteins.toFixed(2)} g`,
          fats: `${comidaGuardada.nutricional.fats.toFixed(2)} g`,
          carbs: `${comidaGuardada.nutricional.carbs.toFixed(2)} g`,
          sugars: `${comidaGuardada.nutricional.sugars.toFixed(2)} g`,
        },
        calorias: `${comidaGuardada.calorias.toFixed(2)} kcal`,
        fechaConsulta: comidaGuardada.fechaConsulta,
      },
      totalCaloriasDia: `${sumaDiaria.toFixed(2)} kcal`,
    });
  } catch (error) {
    console.error(
      "❌ Error en POST /api/comidas:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ mensaje: "Error al consultar Edamam o guardar en BD." });
  }
});

// GET /api/comidas/dia?usuarioId=usuario123&fecha=YYYY-MM-DD
router.get("/dia", async (req, res) => {
  const { usuarioId, fecha } = req.query;
  if (!usuarioId || !fecha) {
    return res
      .status(400)
      .json({ mensaje: "usuarioId y fecha son requeridos" });
  }

  try {
    const comidas = await Comida.find({ usuarioId, fecha });
    res.json(comidas);
  } catch (err) {
    console.error("❌ Error al consultar comidas del día:", err.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// POST manual sin IA
router.post("/manual", async (req, res) => {
  const { usuarioId, fecha, title, calorias, foto } = req.body;

  if (!usuarioId || !fecha || !title || calorias === undefined) {
    return res.status(400).json({
      mensaje: "Faltan datos. Se requiere usuarioId, fecha, title y calorías.",
    });
  }

  try {
    const nuevaComida = new Comida({
      usuarioId,
      fecha,
      title,
      ingredientes: [], // vacío porque es manual
      foto: foto || null,
      nutricional: {
        calories: parseFloat(calorias),
        proteins: 0,
        fats: 0,
        carbs: 0,
        sugars: 0,
      },
      calorias: parseFloat(calorias),
      fechaConsulta: new Date(),
    });

    const comidaGuardada = await nuevaComida.save();

    let registro = await RegistroDiario.findOne({ usuarioId, fecha });
    if (registro) {
      registro.comidas.push(comidaGuardada._id);
      await registro.save();
    } else {
      registro = new RegistroDiario({
        usuarioId,
        fecha,
        comidas: [comidaGuardada._id],
      });
      await registro.save();
    }

    await registro.populate("comidas");
    const sumaDiaria = registro.comidas.reduce(
      (acc, c) => acc + (c.calorias || 0),
      0
    );

    return res.json({
      mensaje: "Comida manual registrada correctamente.",
      comida: {
        _id: comidaGuardada._id,
        title: comidaGuardada.title,
        foto: comidaGuardada.foto,
        calorias: `${comidaGuardada.calorias.toFixed(2)} kcal`,
      },
      totalCaloriasDia: `${sumaDiaria.toFixed(2)} kcal`,
    });
  } catch (err) {
    console.error("❌ Error en POST /api/comidas/manual:", err.message);
    res.status(500).json({ mensaje: "Error al guardar comida manual." });
  }
});


module.exports = router;
