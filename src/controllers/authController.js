const client = require("../utils/twilio");

const dotenv = require('dotenv');
dotenv.config()

const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Format to E.164 for Twilio (+91 for India)
    const formattedNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedNumber,
        channel: "sms",
      });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Format to E.164 for Twilio (+91 for India)
    const formattedNumber = phone.startsWith('+') ? phone : `+91${phone}`;

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedNumber,
        code: otp,
      });

    if (verification.status === "approved") {
      return res.json({
        success: true,
        message: "OTP Verified",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


module.exports = { sendOTP, verifyOTP };





