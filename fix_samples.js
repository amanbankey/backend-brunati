/**
 * fix_samples.js
 * Run this script once to:
 * 1. Enable freeSampleEnabled in the Settings collection
 * 2. Show how many active products exist (used as samples)
 *
 * Usage: node fix_samples.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/brunati';

async function fix() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', MONGO_URI);

    // Load models
    const Settings = require('./src/models/Settings');
    const Product = require('./src/models/Product');

    // Fix Settings
    const settings = await Settings.findOneAndUpdate(
        {},
        { freeSampleEnabled: true, maxSamples: 1 },
        { upsert: true, new: true }
    );
    console.log('Settings updated:', JSON.stringify(settings.toObject(), null, 2));

    // Check active products
    const activeProducts = await Product.find({ isActive: true }).select('name isActive');
    console.log('Active products count:', activeProducts.length);
    if (activeProducts.length === 0) {
        console.log('No active products found! Products need isActive: true to appear as samples.');
        
        // Show all products to diagnose
        const allProducts = await Product.find({}).select('name isActive');
        console.log('All products (' + allProducts.length + ' total):');
        allProducts.forEach(p => console.log(' - ' + p.name + ' | isActive: ' + p.isActive));

        if (allProducts.length > 0) {
            // Activate all products
            const result = await Product.updateMany({}, { isActive: true });
            console.log('Activated ' + result.modifiedCount + ' products.');
        } else {
            console.log('No products in the database at all. Please add products via the admin panel first.');
        }
    } else {
        activeProducts.forEach(p => console.log(' - ' + p.name));
    }

    await mongoose.disconnect();
    console.log('Done. Restart your backend server and try again.');
}

fix().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
