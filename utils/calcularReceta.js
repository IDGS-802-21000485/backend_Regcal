function calcularTotales(ingredientesReceta, ingredientesDB) {
  const totales = {
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0,
    sugars: 0
  };

  ingredientesReceta.forEach(item => {
    const ing = ingredientesDB.find(i => i._id.toString() === item.ingredienteId);

    if (!ing) return;

    const factor = item.gramos / 100;

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
