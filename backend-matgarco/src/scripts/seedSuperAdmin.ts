import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matgarco');
    console.log('📦 Connected to MongoDB');

    const email = 'admin@matgarco.com';
    const password = 'admin123456'; // Mongoose pre-save hook handles hashing automatically

    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
      existing.password = password;
      await existing.save();
      console.log('✅ Updated existing Super Admin password successfully! (admin@matgarco.com / admin123456)');
      process.exit(0);
    }

    await User.create({
      firstName: 'Matgarco',
      lastName: 'Admin',
      email,
      password,
      role: 'super_admin',
      phone: '+201000000000',
      emailVerified: true,
      isActive: true
    });

    console.log('✅ Super Admin created successfully! (admin@matgarco.com / admin123456)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
