const multer = require("multer");
const { storage } = require("../config/cloudinary");

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 4.5 * 1024 * 1024 // 4.5 MB limit for Vercel payload
    }
});


module.exports = upload;
