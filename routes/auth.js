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

// Actualizar usuario (nueva ruta)
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      email, 
      fechaNacimiento, 
      estatura, 
      peso, 
      actividad, 
      objetivo,
      password // Opcional para cambiar contraseña
    } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !fechaNacimiento || !estatura || !peso || !actividad || !objetivo) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    // Buscar usuario existente
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email !== usuario.email) {
      const existeEmail = await Usuario.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({ mensaje: 'El correo electrónico ya está en uso' });
      }
    }

    // Actualizar datos básicos
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.fechaNacimiento = fechaNacimiento;
    usuario.estatura = estatura;
    usuario.peso = peso;
    usuario.actividad = actividad;
    usuario.objetivo = objetivo;

    // Actualizar contraseña si se proporciona
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      usuario.password = hashed;
    }

    // Recalcular calorías
    const edad = calcularEdad(fechaNacimiento);
    const tmb = calcularTMB(peso, estatura, edad);
    const factorActividad = obtenerFactorActividad(actividad);
    const mantenimiento = tmb * factorActividad;
    const deficit = objetivo === 'ligero' ? mantenimiento - 300 : mantenimiento - 500;

    usuario.caloriasMantenimiento = Math.round(mantenimiento);
    usuario.caloriasObjetivo = Math.round(deficit);

    // Guardar cambios
    await usuario.save();

    // Generar nuevo token si cambió el email o contraseña
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      mensaje: 'Datos actualizados correctamente',
      token: password || email !== usuario.email ? token : undefined, // Enviar nuevo token solo si cambió email o password
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        fechaNacimiento: usuario.fechaNacimiento,
        estatura: usuario.estatura,
        peso: usuario.peso,
        actividad: usuario.actividad,
        objetivo: usuario.objetivo,
        caloriasMantenimiento: usuario.caloriasMantenimiento,
        caloriasObjetivo: usuario.caloriasObjetivo
      }
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
});

// Funciones auxiliares
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