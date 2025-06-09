// Ruta: backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const router = express.Router();

// Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      fechaNacimiento,
      estatura,
      peso,
      actividad,
      objetivo
    } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: 'Correo ya registrado.' });

    const hashed = await bcrypt.hash(password, 10);
    const edad = calcularEdad(fechaNacimiento);
    const tmb = calcularTMB(peso, estatura, edad); // Suponemos hombre por ahora
    const factorActividad = obtenerFactorActividad(actividad);
    const mantenimiento = tmb * factorActividad;
    const deficit = objetivo === 'ligero' ? mantenimiento - 300 : mantenimiento - 500;

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashed,
      fechaNacimiento,
      estatura,
      peso,
      actividad,
      objetivo,
      caloriasMantenimiento: Math.round(mantenimiento),
      caloriasObjetivo: Math.round(deficit)
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ mensaje: 'Credenciales incorrectas' });

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(400).json({ mensaje: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

function calcularEdad(fechaNac) {
  const nac = new Date(fechaNac);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function calcularTMB(peso, estatura, edad) {
  // Fórmula de Harris-Benedict (suponiendo sexo masculino)
  return 66.5 + (13.75 * peso) + (5.003 * estatura) - (6.755 * edad);
}

function obtenerFactorActividad(actividad) {
  const factores = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9
  };
  return factores[actividad] || 1.2;
}

module.exports = router;
