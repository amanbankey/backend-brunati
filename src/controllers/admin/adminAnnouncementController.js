const Announcement = require("../../models/Announcement");

exports.createAnnouncement = async (req, res) => {
    try {
        const announcement = new Announcement(req.body);
        await announcement.save();
        res.status(201).json({ status: true, message: "Announcement created successfully", data: announcement });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!announcement) {
            return res.status(404).json({ status: false, message: "Announcement not found", data: null });
        }
        res.json({ status: true, message: "Announcement updated successfully", data: announcement });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message, data: null });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).json({ status: false, message: "Announcement not found", data: null });
        }
        res.json({ status: true, message: "Announcement deleted successfully", data: null });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};

exports.getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ priority: -1, createdAt: -1 });
        res.json({ status: true, message: "Announcements fetched successfully", data: announcements });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};
