const { cloudinary } = require("../config/cloudinary");

/**
 * Extracts the Cloudinary public_id from a full URL.
 * Example URL: https://res.cloudinary.com/demo/image/upload/v12345/brunati_products/sample.jpg
 * Public ID: brunati_products/sample
 * @param {string} url - The Cloudinary image URL.
 * @returns {string|null} - The public_id or null if extraction fails.
 */
const getPublicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        // Cloudinary URLs usually follow this pattern:
        // https://res.cloudinary.com/[cloud-name]/[resource-type]/[type]/[transformations]/v[version]/[public-id].[extension]
        
        const parts = url.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex === -1) return null;

        // The public ID starts after the version (v[digits])
        // If there's no version, it starts a few parts after 'upload'
        // Let's try to find where v[digits] is
        let startIndex = uploadIndex + 1;
        for (let i = uploadIndex + 1; i < parts.length; i++) {
            if (parts[i].startsWith('v') && /v\d+/.test(parts[i])) {
                startIndex = i + 1;
                break;
            }
        }

        // Join the remaining parts and remove the file extension
        const remaining = parts.slice(startIndex).join("/");
        const publicId = remaining.includes('.') ? remaining.substring(0, remaining.lastIndexOf('.')) : remaining;
        
        return publicId;
    } catch (error) {
        console.error("Error extracting public_id:", error.message);
        return null;
    }
};

/**
 * Deletes a single asset from Cloudinary.
 * @param {string} url - The Cloudinary asset URL.
 */
const deleteFromCloudinary = async (url) => {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return;

    // Determine resource_type based on URL/extension
    let resourceType = 'image';
    if (url.match(/\.(mp4|mov|avi|mkv|webm)$|video\/upload/i)) {
        resourceType = 'video';
    }

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`Deleted ${resourceType} from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error(`Failed to delete ${resourceType} from Cloudinary: ${publicId}`, error.message);
    }
};

/**
 * Deletes multiple assets from Cloudinary.
 * @param {string[]} urls - Array of Cloudinary asset URLs.
 */
const deleteMultipleFromCloudinary = async (urls) => {
    if (!urls || !Array.isArray(urls)) return;
    const cleanUrls = urls.filter(u => typeof u === 'string' && u.startsWith('http'));
    for (const url of cleanUrls) {
        await deleteFromCloudinary(url);
    }
};

module.exports = {
    getPublicIdFromUrl,
    deleteFromCloudinary,
    deleteMultipleFromCloudinary
};
