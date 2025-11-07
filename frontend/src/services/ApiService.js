import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

axios.defaults.withCredentials = true;

export class ApiService {
  // Device Management
  static async enrollDevice(deviceData) {
    const response = await axios.post(`${API_BASE_URL}/device/enroll`, deviceData);
    return response.data;
  }

  static async getDevices() {
    const response = await axios.get(`${API_BASE_URL}/device/list`);
    return response.data;
  }

  static async removeDevice(deviceId) {
    const response = await axios.post(`${API_BASE_URL}/device/remove`, { deviceId });
    return response.data;
  }

  // Key Management
  static async getPublicKeys(userId) {
    const response = await axios.get(`${API_BASE_URL}/key/public/${userId}`);
    return response.data;
  }

  static async publishPrekeyBundle(prekeyBundle) {
    const response = await axios.post(`${API_BASE_URL}/key/prekey`, { prekeyBundle });
    return response.data;
  }

  // Session Management
  static async initiateHandshake(recipientUserId, handshakeData) {
    const response = await axios.post(`${API_BASE_URL}/session/handshake`, {
      recipientUserId,
      handshakeData
    });
    return response.data;
  }

  // Messaging
  static async sendMessage(messageData) {
    const response = await axios.post(`${API_BASE_URL}/message/send`, messageData);
    return response.data;
  }

  static async getUnreadMessages() {
    const response = await axios.get(`${API_BASE_URL}/message/unread`);
    return response.data;
  }

  static async markMessageRead(msgId) {
    const response = await axios.post(`${API_BASE_URL}/message/read`, { msgId });
    return response.data;
  }

  static async postReceipt(msgId, type) {
    const response = await axios.post(`${API_BASE_URL}/message/receipt`, { msgId, type });
    return response.data;
  }

  // Attachments
  static async uploadAttachment(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/attachment/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  static async downloadAttachment(fileId) {
    const response = await axios.get(`${API_BASE_URL}/attachment/download/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Groups
  static async createGroup(groupData) {
    const response = await axios.post(`${API_BASE_URL}/group/create`, groupData);
    return response.data;
  }

  static async updateGroup(updateData) {
    const response = await axios.post(`${API_BASE_URL}/group/update`, updateData);
    return response.data;
  }

  static async getGroups() {
    const response = await axios.get(`${API_BASE_URL}/group/list`);
    return response.data;
  }
}

export default ApiService;