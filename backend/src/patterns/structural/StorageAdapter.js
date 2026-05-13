const multer = require('multer');
const path = require('path');

// Interfaz esperada
class IStorageAdapter {
  uploadFile(req, res) { throw new Error('Not implemented'); }
}

class LocalStorageAdapter extends IStorageAdapter {
  constructor() {
    super();
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../uploads'));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

    this.upload = multer({
      storage: this.storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }).single('file');
  }

  uploadFile(req, res) {
    return new Promise((resolve, reject) => {
      console.log('🔌 [Adapter] Usando almacenamiento local...');
      this.upload(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return reject(new Error('El archivo excede el tamaño máximo de 10 MB'));
          }
          return reject(err);
        }
        if (!req.file) return reject(new Error('No se proporcionó archivo'));
        
        resolve({
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/${req.file.filename}`,
        });
      });
    });
  }
}

module.exports = new LocalStorageAdapter();
