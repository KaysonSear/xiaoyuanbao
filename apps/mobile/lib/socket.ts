import { io, Socket } from 'socket.io-client';

// Use localhost for emulator (Android 10.0.2.2 or machine IP)
// Since we are running on host machine and accessing via "localhost" from host,
// but for Emulator we need host IP.
// However, the project seems to be using web/dev setup often.
// We'll use a constant that can be swapped.
// For now, assume localhost:3000 (if web) or 10.0.2.2:3000 (if android emulator).
// Let's use string from config or default.

const SOCKET_URL = 'http://10.201.214.15:3000'; // Replace with your IP if testing on device

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'], // force websocket
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(userId: string) {
    if (this.socket) {
      this.socket.emit('join_room', userId);
    }
  }

  getSocket() {
    if (!this.socket) {
      this.connect();
    }
    return this.socket;
  }
}

export const socketService = new SocketService();
