import { connectDatabase } from '../config/database';
import mongoose from 'mongoose';

let connected = false;

export async function setupDB() {
  if (!connected) {
    await connectDatabase();
    connected = true;
  }
}

export async function teardownDB() {
  if (connected) {
    await mongoose.connection.close();
    connected = false;
  }
}
