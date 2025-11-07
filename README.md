# Secure Chat Platform

A privacy-focused chat platform built with the MERN stack featuring client-side end-to-end encryption. All messages are encrypted before transmission, ensuring zero plaintext exposure on the server.

## Features

- **End-to-End Encryption**: All messages encrypted client-side using Ed25519 and X25519 cryptography
- **Multi-Device Support**: Each device generates unique key pairs with secure key management
- **Zero Server Knowledge**: Backend only stores encrypted message envelopes and metadata
- **Device Verification**: QR-based device enrollment and verification
- **REST API**: Complete API for all messaging workflows
- **Secure Authentication**: JWT-based auth with HttpOnly cookies
- **File Attachments**: Encrypted file upload/download support
- **Group Chat**: Multi-participant encrypted group messaging

## Architecture

### Backend (Node.js/Express)
- **Authentication**: JWT with secure cookie storage
- **Database**: MongoDB for metadata storage (no plaintext)
- **Security**: Helmet, CORS, rate limiting, input validation
- **File Storage**: Encrypted attachment handling

### Frontend (React)
- **Crypto**: Client-side encryption using @noble/ed25519 and TweetNaCl
- **Key Storage**: Secure key storage in IndexedDB
- **Device Management**: Multi-device key synchronization
- **Real-time**: Polling-based message updates

## Security Model

1. **Key Generation**: Each device generates Ed25519 (signing) and X25519 (encryption) key pairs
2. **Message Encryption**: Messages encrypted with recipient's public key before transmission
3. **Server Blindness**: Server never sees plaintext messages or private keys
4. **Forward Secrecy**: Unique ephemeral keys for each message
5. **Device Verification**: QR codes for trusted device enrollment

## Installation

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Device Management
- `POST /api/device/enroll` - Register new device
- `GET /api/device/list` - List user's devices
- `POST /api/device/remove` - Remove device
- `POST /api/device/rotatekey` - Rotate device keys
- `POST /api/device/sync` - Sync device state

### Key Management
- `GET /api/key/public/:userId` - Get user's public keys
- `POST /api/key/prekey` - Publish prekey bundle

### Messaging
- `POST /api/message/send` - Send encrypted message
- `GET /api/message/unread` - Fetch unread messages
- `POST /api/message/read` - Mark message as read
- `POST /api/message/receipt` - Post delivery receipt

### Attachments
- `POST /api/attachment/upload` - Upload encrypted file
- `GET /api/attachment/download/:id` - Download encrypted file

### Groups
- `POST /api/group/create` - Create group chat
- `POST /api/group/update` - Update group membership
- `GET /api/group/list` - List user's groups

## Database Schema

### Users
```javascript
{
  userId: String,
  name: String,
  email: String,
  passwordHash: String,
  devices: [ObjectId],
  settings: Map
}
```

### Devices
```javascript
{
  deviceId: String,
  userId: String,
  name: String,
  publicKey: {
    ed25519: String,
    x25519: String
  },
  prekeyBundle: Object,
  lastSeen: Date,
  isActive: Boolean
}
```

### Messages
```javascript
{
  msgId: String,
  convId: String,
  senderId: String,
  senderDeviceId: String,
  recipientIds: [String],
  ciphertext: String,        // Encrypted payload
  envelopeData: Map,         // Metadata only
  deliveryReceipts: [Object],
  messageType: String
}
```

## Usage

1. **Register**: Create account with email/password
2. **Device Setup**: Generate device keys and get QR verification code
3. **Start Chat**: Enter recipient's User ID and send encrypted messages
4. **Multi-Device**: Add additional devices using QR verification
5. **Groups**: Create group chats with multiple participants

## Security Considerations

- Private keys never leave the device
- All encryption/decryption happens client-side
- Server cannot decrypt messages or access private keys
- Each message uses unique ephemeral keys
- Device verification prevents MITM attacks
- Forward secrecy through key rotation

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file for details