function calcularCalorias(peso, estatura, fechaNacimiento, actividad, objetivo) {
  // Calcular edad
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  // Fórmula Mifflin-St Jeor para hombres
  let mantenimiento = 10 * peso + 6.25 * estatura - 5 * edad + 5;

  // Ajuste por nivel de actividad
  const factoresActividad = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    intenso: 1.725
  };

  mantenimiento *= factoresActividad[actividad] || 1.2;

  // Ajuste por objetivo
  const ajustesObjetivo = {
    ligero: -300,    // Déficit ligero
    pesado: -500     // Déficit fuerte
  };

  const objetivoCalorico = mantenimiento + (ajustesObjetivo[objetivo] || 0);

  return {
    mantenimiento: Math.round(mantenimiento),
    objetivo: Math.round(objetivoCalorico)
  };
}

module.exports = { calcularCalorias };