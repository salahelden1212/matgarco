import { connectDatabase } from '../config/database';
import mongoose from 'mongoose';

let connected = false;

export async function setupTestDB() {
  if (!connected) {
    await connectDatabase();
    connected = true;
  }
}

export async function teardownTestDB() {
  if (connected) {
    await mongoose.connection.close();
    connected = false;
  }
}
