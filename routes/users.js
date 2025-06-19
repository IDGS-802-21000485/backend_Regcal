const express = require('express');
const router = express.Router();
const User = require('../models/Usuario');
const { calcularCalorias } = require('../utils/calculoCalorias');

// Actualizar datos del usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, fechaNacimiento, estatura, peso, actividad, objetivo } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !fechaNacimiento || !estatura || !peso || !actividad || !objetivo) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    // Buscar usuario existente
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Actualizar datos
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.fechaNacimiento = fechaNacimiento;
    usuario.estatura = estatura;
    usuario.peso = peso;
    usuario.actividad = actividad;
    usuario.objetivo = objetivo;

    // Recalcular calorías
    const { mantenimiento, objetivo: caloriasObjetivo } = calcularCalorias(
      usuario.peso,
      usuario.estatura,
      usuario.fechaNacimiento,
      usuario.actividad,
      usuario.objetivo
    );

    usuario.caloriasMantenimiento = mantenimiento;
    usuario.caloriasObjetivo = caloriasObjetivo;

    // Guardar cambios
    await usuario.save();

    res.json({
      mensaje: 'Datos actualizados correctamente',
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

module.exports = router;