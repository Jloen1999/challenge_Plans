import { Server } from 'socket.io';

declare global {
  namespace NodeJS {
    interface Global {
      socketServer: Server;
    }
  }
}

export {};
