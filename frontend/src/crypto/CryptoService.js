import * as ed25519 from '@noble/ed25519';
import { x25519 } from '@noble/curves/ed25519';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

// Set hash function for ed25519
ed25519.etc.sha512Sync = (...m) => {
  const combined = new Uint8Array(m.reduce((acc, val) => acc + val.length, 0));
  let offset = 0;
  for (const arr of m) {
    combined.set(arr, offset);
    offset += arr.length;
  }
  return nacl.hash(combined);
};

export class CryptoService {
  static async generateDeviceKeys() {
    const ed25519PrivateKey = ed25519.utils.randomPrivateKey();
    const ed25519PublicKey = await ed25519.getPublicKey(ed25519PrivateKey);
    const x25519KeyPair = nacl.box.keyPair();

    const keys = {
      ed25519: {
        privateKey: encodeBase64(ed25519PrivateKey),
        publicKey: encodeBase64(ed25519PublicKey)
      },
      x25519: {
        privateKey: encodeBase64(x25519KeyPair.secretKey),
        publicKey: encodeBase64(x25519KeyPair.publicKey)
      }
    };

    await this.storeDeviceKeys(keys);
    return keys;
  }

  static async generatePrekeyBundle(deviceKeys) {
    const signedPrekeyPair = nacl.box.keyPair();
    const signedPrekeyPublic = encodeBase64(signedPrekeyPair.publicKey);
    const ed25519PrivateKey = decodeBase64(deviceKeys.ed25519.privateKey);
    const signature = await ed25519.sign(signedPrekeyPair.publicKey, ed25519PrivateKey);

    const oneTimePrekeys = [];
    for (let i = 0; i < 10; i++) {
      const prekeyPair = nacl.box.keyPair();
      oneTimePrekeys.push(encodeBase64(prekeyPair.publicKey));
    }

    return {
      identityKey: deviceKeys.ed25519.publicKey,
      signedPrekey: signedPrekeyPublic,
      prekeySignature: encodeBase64(signature),
      oneTimePrekeys
    };
  }

  static async encryptMessage(message, recipientPublicKey) {
    const messageBytes = new TextEncoder().encode(message);
    const recipientKey = decodeBase64(recipientPublicKey);
    const ephemeralKeyPair = nacl.box.keyPair();
    const nonce = nacl.randomBytes(24);
    const ciphertext = nacl.box(messageBytes, nonce, recipientKey, ephemeralKeyPair.secretKey);

    return {
      ciphertext: encodeBase64(ciphertext),
      nonce: encodeBase64(nonce),
      ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey)
    };
  }

  static async decryptMessage(encryptedData, privateKey) {
    const ciphertext = decodeBase64(encryptedData.ciphertext);
    const nonce = decodeBase64(encryptedData.nonce);
    const ephemeralPublicKey = decodeBase64(encryptedData.ephemeralPublicKey);
    const privateKeyBytes = decodeBase64(privateKey);
    const decrypted = nacl.box.open(ciphertext, nonce, ephemeralPublicKey, privateKeyBytes);
    
    if (!decrypted) throw new Error('Decryption failed');
    return new TextDecoder().decode(decrypted);
  }

  static async storeDeviceKeys(keys) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SecureChatDB', 1);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction(['keys'], 'readwrite');
        const store = transaction.objectStore('keys');
        store.put({ id: 'deviceKeys', keys });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  static async getDeviceKeys() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SecureChatDB', 1);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('keys')) {
          resolve(null);
          return;
        }
        const transaction = db.transaction(['keys'], 'readonly');
        const store = transaction.objectStore('keys');
        const getRequest = store.get('deviceKeys');
        getRequest.onsuccess = () => resolve(getRequest.result?.keys || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export default CryptoService;
