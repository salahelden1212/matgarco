import User from '../models/User';
import Merchant from '../models/Merchant';

export const seedDefaultAccounts = async () => {
  try {
    // 1. Seed Super Admin
    const superAdminEmail = 'admin@matgarco.com';
    const existingAdmin = await User.findOne({ email: superAdminEmail });
    if (!existingAdmin) {
      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: superAdminEmail,
        password: 'password123',
        role: 'super_admin',
        emailVerified: true,
      });
      console.log(`✅ Default Super Admin created: ${superAdminEmail} / password123`);
    }

    // 2. Seed Merchant Owner
    const merchantEmail = 'merchant@matgarco.com';
    let merchantUser = await User.findOne({ email: merchantEmail });
    
    if (!merchantUser) {
      merchantUser = await User.create({
        firstName: 'Demo',
        lastName: 'Merchant',
        email: merchantEmail,
        password: 'password123',
        role: 'merchant_owner',
        emailVerified: true,
      });
      console.log(`✅ Default Merchant User created: ${merchantEmail} / password123`);
    }

    const storeSubdomain = 'demo-store';
    const existingMerchantStore = await Merchant.findOne({ subdomain: storeSubdomain });
    
    if (!existingMerchantStore && merchantUser) {
      const merchantStore = await Merchant.create({
        storeName: 'Demo Store',
        subdomain: storeSubdomain,
        email: merchantEmail,
        ownerId: merchantUser._id,
        subscriptionPlan: 'professional',
        subscriptionStatus: 'active',
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        onboardingCompleted: true,
      });

      // Update user with merchantId
      merchantUser.merchantId = merchantStore._id;
      await merchantUser.save();
      
      console.log(`✅ Default Store created: ${storeSubdomain} (linked to ${merchantEmail})`);
    }

  } catch (error) {
    console.error('❌ Error seeding default accounts:', error);
  }
};
