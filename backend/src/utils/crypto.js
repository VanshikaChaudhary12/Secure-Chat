const crypto = require('crypto');

// Utility functions for server-side crypto operations (non-sensitive)
class CryptoUtils {
  static generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  static generateNonce() {
    return crypto.randomBytes(24).toString('base64');
  }

  static hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static verifySignature(data, signature, publicKey) {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      return false;
    }
  }
}

module.exports = CryptoUtils;