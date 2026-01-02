function calcularTotales(ingredientesReceta, ingredientesDB) {
  const totales = {
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0,
    sugars: 0
  };

  ingredientesReceta.forEach(item => {
    const ing = ingredientesDB.find(
      i => i._id.toString() === item.ingredienteId.toString()
    );

    if (!ing) return;

    // 1️⃣ Determinar cantidad real en base (g o ml)
    let cantidadReal = item.cantidad;

    if (item.unidad !== ing.unidadBase) {
      const conversion = ing.conversiones?.[item.unidad];
      if (!conversion) {
        console.warn(`No existe conversión para ${item.unidad} en ${ing.nombre}`);
        return;
      }
      cantidadReal = conversion * item.cantidad;
    }

    // 2️⃣ Calcular factor sobre base 100
    const factor = cantidadReal / ing.cantidadBase;

    // 3️⃣ Sumar nutrientes
    totales.calories += ing.nutricional.calories * factor;
    totales.proteins += ing.nutricional.proteins * factor;
    totales.fats     += ing.nutricional.fats * factor;
    totales.carbs    += ing.nutricional.carbs * factor;
    totales.sugars   += ing.nutricional.sugars * factor;
  });

  return {
    calories: Math.round(totales.calories),
    proteins: Math.round(totales.proteins),
    fats:     Math.round(totales.fats),
    carbs:    Math.round(totales.carbs),
    sugars:   Math.round(totales.sugars)
  };
}

module.exports = calcularTotales;
