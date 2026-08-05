const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const internosRoutes = require('./routes/internosRoutes');
const cambiosRoutes = require('./routes/cambiosRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir estáticos de imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ERSA Group Fleet API', timestamp: new Date().toISOString() });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/internos', internosRoutes);
app.use('/api/cambios', cambiosRoutes);
app.use('/api/exportar', exportRoutes);

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint API no encontrado.' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ success: false, error: err.message || 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ERSA API corriendo en puerto ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
