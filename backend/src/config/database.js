// ============================================
// PATRÓN SINGLETON - Conexión a Base de Datos
// ============================================
// Garantiza que solo exista UNA instancia de la conexión 
// a MongoDB en toda la aplicación, evitando múltiples 
// conexiones innecesarias y optimizando recursos.
// ============================================

const mongoose = require('mongoose');

class Database {
  // Variable estática privada que almacena la única instancia
  static instance = null;

  constructor() {
    // Prevenir instanciación directa con 'new'
    if (Database.instance) {
      throw new Error(
        'No se puede crear otra instancia de Database. Use Database.getInstance()'
      );
    }
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Método estático que retorna la única instancia de Database.
   * Si no existe, la crea. Si ya existe, retorna la existente.
   * @returns {Database} La instancia única de Database
   */
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
      console.log('🔧 [Singleton] Nueva instancia de Database creada');
    } else {
      console.log('♻️  [Singleton] Reutilizando instancia existente de Database');
    }
    return Database.instance;
  }

  /**
   * Conecta a MongoDB usando la URI proporcionada.
   * Si ya hay una conexión activa, la reutiliza.
   * @param {string} uri - URI de conexión a MongoDB
   * @returns {Promise<mongoose.Connection>}
   */
  async connect(uri) {
    if (this.isConnected) {
      console.log('♻️  [Singleton] Conexión a MongoDB ya existente, reutilizando...');
      return this.connection;
    }

    try {
      const conn = await mongoose.connect(uri, {
        // Opciones de conexión optimizadas
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.connection = conn.connection;
      this.isConnected = true;

      console.log(`✅ [Singleton] MongoDB conectado: ${conn.connection.host}`);
      console.log(`📦 [Singleton] Base de datos: ${conn.connection.name}`);

      // Manejar eventos de conexión
      this.connection.on('error', (err) => {
        console.error('❌ [Singleton] Error en conexión MongoDB:', err);
        this.isConnected = false;
      });

      this.connection.on('disconnected', () => {
        console.warn('⚠️  [Singleton] MongoDB desconectado');
        this.isConnected = false;
      });

      return this.connection;
    } catch (error) {
      console.error('❌ [Singleton] Error conectando a MongoDB:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Obtiene la conexión activa.
   * @returns {mongoose.Connection|null}
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Desconecta de MongoDB.
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.isConnected = false;
      this.connection = null;
      console.log('🔌 [Singleton] MongoDB desconectado correctamente');
    }
  }
}

module.exports = Database;
