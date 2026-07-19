const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brunati";

const productsData = [
    {
        name: "Dominus Emperor",
        categoryName: "Men",
        description: "A bold and regal fragrance designed for the modern visionary. Speaking volumes with notes of rich oud, sensual patchouli, and a hint of saffron.",
        images: ["media/dominus/1.png", "media/dominus/2.png", "media/dominus/3.png"],
        mainAccords: ["Warm Spicy", "Woody", "Tobacco", "Whiskey", "Oud", "Sweet", "Amber", "Balsamic", "Vanilla", "Smoky"],
        topNotes: ["Whiskey"],
        middleNotes: ["Spicy Notes", "Cinnamon", "Coriander"],
        baseNotes: ["Tobacco", "Agarwood (Oud)", "Incense", "Sandalwood", "Patchouli", "Benzoin", "Vanilla", "Cedar"],
        mrp: 1795,
        sellingPrice: 1095,
        storyVisual: "media/banner/DEc.png"
    },
    {
        name: "Brunati Aqua",
        categoryName: "Unisex",
        description: "Crystalline depths of the Mediterranean captured in a bottle. A surge of mineral freshness, aromatic herbs, and marine notes.",
        images: ["media/aqua/1.png", "media/aqua/2.png", "media/aqua/3.png"],
        mainAccords: ["Aromatic", "Marine", "Fresh Spicy", "Woody", "Citrus", "Earthy"],
        topNotes: ["Sea Notes", "Bergamot"],
        middleNotes: ["Sage", "Geranium", "Rosemary"],
        baseNotes: ["Incense", "Patchouli"],
        mrp: 1795,
        sellingPrice: 1095,
        storyVisual: "media/banner/BAc.png"
    },
    {
        name: "Mestia",
        categoryName: "Women",
        description: "An ethereal dance of white florals and creamy sandalwood. Designed for the woman who finds strength in grace.",
        images: ["media/mistia/1.png", "media/mistia/2.png", "media/mistia/3.png"],
        mainAccords: ["Floral", "White Floral", "Musky", "Powdery", "Woody"],
        topNotes: ["White Florals", "Pear"],
        middleNotes: ["Tuberose", "Jasmine"],
        baseNotes: ["Sandalwood", "Musk"],
        mrp: 1795,
        sellingPrice: 1095,
        storyVisual: "media/banner/Mc.png"
    },
    {
        name: "Citrine Dusk",
        categoryName: "Unisex",
        description: "The warmth of a golden sunset. A sophisticated blend of citrus zest, amber, and warm woody base notes for an elegant presence.",
        images: ["media/dusk/1.png", "media/dusk/2.png", "media/dusk/3.png"],
        mainAccords: ["Citrus", "Amber", "Woody", "Powdery", "Fresh"],
        topNotes: ["Citrus Zest", "Bergamot"],
        middleNotes: ["Amber", "Spicy Notes"],
        baseNotes: ["Sandalwood", "Oakmoss"],
        mrp: 1795,
        sellingPrice: 1095,
        storyVisual: "media/banner/CDc.png"
    },
    {
        name: "Midnight Glammer",
        categoryName: "Women",
        description: "Provocative and deep. Dark Cherry and Tonka Bean meet a base of smoky Vetiver for a mysterious allure.",
        images: ["media/midnight/1.png", "media/midnight/2.png", "media/midnight/3.png"],
        mainAccords: ["Fruity", "Sweet", "Vanilla", "Balsamic", "Smoky"],
        topNotes: ["Dark Cherry", "Almond"],
        middleNotes: ["Tonka Bean", "Rose de Grasse"],
        baseNotes: ["Vetiver", "Vanilla", "Cedar"],
        mrp: 1795,
        sellingPrice: 1095,
        storyVisual: "media/banner/MGc.png"
    }
];

async function seed() {
    console.log("Connecting to", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected!");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing categories and products.");

    // Create Categories
    const categoriesToCreate = ["Men", "Women", "Unisex"];
    const categoryMap = {};

    for (const catName of categoriesToCreate) {
        const cat = await Category.create({ name: catName, isActive: true });
        categoryMap[catName] = cat._id;
        console.log(`Created Category: ${catName} (${cat._id})`);
    }

    // Create Products
    for (const p of productsData) {
        const catId = categoryMap[p.categoryName];
        if (!catId) {
            console.error(`Category ${p.categoryName} not found for product ${p.name}`);
            continue;
        }

        const product = new Product({
            name: p.name,
            description: p.description,
            category: catId,
            images: p.images,
            mainAccords: p.mainAccords,
            perfumePyramid: {
                top: p.topNotes,
                middle: p.middleNotes,
                base: p.baseNotes
            },
            sizes: [
                {
                    size: "100ml",
                    mrp: p.mrp,
                    sellingPrice: p.sellingPrice,
                    stock: 999
                }
            ],
            story: {
                storyImages: [p.storyVisual],
                sections: []
            },
            isActive: true
        });

        await product.save();
        console.log(`Created Product: ${p.name} (slug: ${product.slug})`);
    }

    console.log("Seeding complete!");
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
