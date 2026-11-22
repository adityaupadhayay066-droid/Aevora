const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// AES Encryption config
function getEncryptionKey() {
  if (process.env.ENCRYPTION_KEY) {
    return process.env.ENCRYPTION_KEY;
  }
  if (process.env.JWT_SECRET) {
    return crypto.createHash('sha256').update(process.env.JWT_SECRET).digest('hex');
  }
  throw new Error('Encryption key missing: Neither ENCRYPTION_KEY nor JWT_SECRET is configured.');
}
const GCM_PREFIX = 'gcm:';
const GCM_IV_LENGTH = 12; // 96-bit IV recommended for GCM

function isGcmEncrypted(text) {
  if (typeof text !== 'string' || !text.startsWith(GCM_PREFIX)) return false;
  const parts = text.slice(GCM_PREFIX.length).split(':');
  return parts.length === 3 && parts[0].length === 24 && parts[1].length === 32 && parts[2].length > 0;
}

function encrypt(text) {
  if (!text) return text;
  // If already encrypted with AES-256-GCM, avoid re-encrypting
  if (isGcmEncrypted(text)) return text;

  const key = Buffer.from(getEncryptionKey(), 'hex');
  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${GCM_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(text) {
  if (!text || typeof text !== 'string') return text;

  // 1. Authenticated AES-256-GCM decryption
  if (isGcmEncrypted(text)) {
    try {
      const parts = text.slice(GCM_PREFIX.length).split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encryptedText = Buffer.from(parts[2], 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(getEncryptionKey(), 'hex'), iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (_gcmError) {
      return text;
    }
  }

  // 2. Legacy AES-256-CBC decryption fallback (for existing database records)
  const legacyParts = text.split(':');
  if (legacyParts.length === 2 && HEX_32_REGEX.test(legacyParts[0])) {
    try {
      const iv = Buffer.from(legacyParts[0], 'hex');
      const encryptedText = Buffer.from(legacyParts[1], 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(getEncryptionKey(), 'hex'), iv);
      const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (_cbcError) {
      return text;
    }
  }

  return text;
}


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
    set(val) {
      this.setDataValue('phone_number', encrypt(val));
    },
    get() {
      return decrypt(this.getDataValue('phone_number'));
    }
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  trusted_devices: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  failed_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  suspended_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: ''
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
    set(val) {
      this.setDataValue('location', encrypt(val));
    },
    get() {
      return decrypt(this.getDataValue('location'));
    }
  },
  theme_preference: {
    type: DataTypes.ENUM('dark', 'light', 'system'),
    defaultValue: 'dark'
  },
  account_status: {
    type: DataTypes.ENUM('active', 'pending_verification', 'deactivated', 'deleted', 'suspended'),
    defaultValue: 'pending_verification'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_ip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  admin_role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'data_manager', 'support_admin'),
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return safe user object (no password)
User.prototype.toSafeObject = function () {
  const { password, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;
