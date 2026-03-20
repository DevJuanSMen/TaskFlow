const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/env');
const Database = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const boardRoutes = require('./routes/board.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();

// ============================================
// Middleware
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// Rutas
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TaskFlow API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// ============================================
// Manejo de errores global
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// Iniciar servidor
// ============================================
const startServer = async () => {
  try {
    // Usar Singleton para conectar a la base de datos
    const db = Database.getInstance();
    await db.connect(config.mongoUri);

    // Demostración del Singleton: obtener la misma instancia
    const db2 = Database.getInstance();
    console.log(`🔍 [Singleton] ¿Misma instancia? ${db === db2}`); // true

    app.listen(config.port, () => {
      console.log(`🚀 TaskFlow API corriendo en puerto ${config.port}`);
      console.log(`📋 Ambiente: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
