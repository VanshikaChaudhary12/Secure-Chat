import React, { useState } from 'react';
import QRCode from 'qrcode';
import { CryptoService } from '../crypto/CryptoService';
import { ApiService } from '../services/ApiService';

const DeviceSetup = ({ onSetup }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [deviceName, setDeviceName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');

  const handleDeviceSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Generate device keys
      const deviceKeys = await CryptoService.generateDeviceKeys();
      
      // Step 2: Generate prekey bundle
      const prekeyBundle = await CryptoService.generatePrekeyBundle(deviceKeys);
      
      // Step 3: Enroll device with backend
      const enrollmentData = {
        name: deviceName,
        publicKey: {
          ed25519: deviceKeys.ed25519.publicKey,
          x25519: deviceKeys.x25519.publicKey
        },
        prekeyBundle
      };

      const result = await ApiService.enrollDevice(enrollmentData);
      
      // Step 4: Generate QR code for device verification
      const qrData = {
        deviceId: result.deviceId,
        publicKey: deviceKeys.ed25519.publicKey,
        timestamp: Date.now()
      };
      
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
      setQrCode(qrCodeDataURL);
      setStep(2);
      
    } catch (error) {
      setError(error.message || 'Device setup failed');
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = () => {
    onSetup();
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          Device Setup
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
              Set up this device for secure messaging. This will generate unique encryption keys for this device.
            </p>
            
            <form onSubmit={handleDeviceSetup}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Device Name
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g., My Laptop, iPhone"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Setting up device...' : 'Setup Device'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ color: '#28a745', marginBottom: '1rem' }}>
              ✓ Device Setup Complete
            </h3>
            
            <p style={{ marginBottom: '2rem', color: '#666' }}>
              Your device has been set up with end-to-end encryption. 
              Use this QR code to verify your device with other users.
            </p>

            {qrCode && (
              <div style={{ marginBottom: '2rem' }}>
                <img 
                  src={qrCode} 
                  alt="Device Verification QR Code"
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              </div>
            )}

            <button
              onClick={completeSetup}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Continue to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceSetup;