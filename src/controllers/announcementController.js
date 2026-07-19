const Announcement = require("../models/Announcement");

exports.getAnnouncements = async (req, res) => {

    const announcements = await Announcement
        .find({ active: true })
        .sort({ priority: 1 });

    res.json({ status: true, message: "Announcements fetched successfully", data: announcements });

};