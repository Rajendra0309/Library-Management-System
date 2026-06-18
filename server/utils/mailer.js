const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });

        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email Error:", error.message);
    }
};

const sendReservationAvailableEmail = async (
    email,
    memberName,
    bookTitle
) => {
    await sendEmail(
        email,
        "Book Available for Pickup",
        `
      <h2>Hello ${memberName},</h2>
      <p>Your reserved book <strong>${bookTitle}</strong> is now available.</p>
      <p>Please collect it before the reservation expires.</p>
    `
    );
};

const sendReservationExpiredEmail = async (
    email,
    memberName,
    bookTitle
) => {
    await sendEmail(
        email,
        "Reservation Expired",
        `
      <h2>Hello ${memberName},</h2>
      <p>Your reservation for <strong>${bookTitle}</strong> has expired.</p>
    `
    );
};

module.exports = {
    sendEmail,
    sendReservationAvailableEmail,
    sendReservationExpiredEmail,
};