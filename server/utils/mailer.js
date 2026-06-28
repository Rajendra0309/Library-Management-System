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
        console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
        console.error("Email Error:", error.message);
    }
};

// Account Lifecycle
const sendWelcomeEmail = async (email, name) => {
    await sendEmail(
        email,
        "Welcome to LibraVault!",
        `<h2>Hello ${name},</h2>
        <p>Welcome to LibraVault! Your account has been successfully registered.</p>
        <p>You can now log in and start borrowing books.</p>`
    );
};

const sendOtpEmail = async (email, name, otp) => {
    await sendEmail(
        email,
        "LibraVault - Verification Code",
        `<h2>Hello ${name || 'User'},</h2>
        <p>Your One-Time Password (OTP) for verification is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes. Do not share it with anyone.</p>`
    );
};

const sendPasswordChangedEmail = async (email, name) => {
    await sendEmail(
        email,
        "Security Alert: Password Changed",
        `<h2>Hello ${name},</h2>
        <p>Your password was recently changed. If this was you, no further action is needed.</p>
        <p>If you did not authorize this change, please contact an administrator immediately.</p>`
    );
};

// Circulation
const sendBorrowEmail = async (email, name, bookTitle, dueDate) => {
    await sendEmail(
        email,
        "Book Issued Successfully",
        `<h2>Hello ${name},</h2>
        <p>You have successfully borrowed <strong>${bookTitle}</strong>.</p>
        <p>Please return it by: <strong>${new Date(dueDate).toDateString()}</strong></p>`
    );
};

const sendReturnEmail = async (email, name, bookTitle, fineAmount) => {
    let fineText = fineAmount > 0 ? `<p>A fine of Rs ${fineAmount} was applied.</p>` : `<p>No fines were applied.</p>`;
    await sendEmail(
        email,
        "Book Returned Successfully",
        `<h2>Hello ${name},</h2>
        <p>Thank you for returning <strong>${bookTitle}</strong>.</p>
        ${fineText}`
    );
};

// Cron Notifications
const sendDueSoonEmail = async (email, name, bookTitle, dueDate) => {
    await sendEmail(
        email,
        "Reminder: Book Due Soon",
        `<h2>Hello ${name},</h2>
        <p>This is a reminder that your borrowed book <strong>${bookTitle}</strong> is due on <strong>${new Date(dueDate).toDateString()}</strong>.</p>
        <p>Please return it on time to avoid late fines.</p>`
    );
};

const sendOverdueFineEmail = async (email, name, bookTitle, fineAmount, daysOverdue) => {
    await sendEmail(
        email,
        "Overdue Notice & Fine Applied",
        `<h2>Hello ${name},</h2>
        <p>Your borrowed book <strong>${bookTitle}</strong> is currently <strong>${daysOverdue} days overdue</strong>.</p>
        <p>A daily fine has been applied. Your new fine amount for this book is: <strong>Rs ${fineAmount}</strong>.</p>
        <p>Please return the book immediately.</p>`
    );
};

// Reservation
const sendReservationAvailableEmail = async (email, memberName, bookTitle) => {
    await sendEmail(
        email,
        "Book Available for Pickup",
        `<h2>Hello ${memberName},</h2>
        <p>Your reserved book <strong>${bookTitle}</strong> is now available.</p>
        <p>Please collect it before the reservation expires.</p>`
    );
};

const sendReservationExpiredEmail = async (email, memberName, bookTitle) => {
    await sendEmail(
        email,
        "Reservation Expired",
        `<h2>Hello ${memberName},</h2>
        <p>Your reservation for <strong>${bookTitle}</strong> has expired.</p>`
    );
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOtpEmail,
    sendPasswordChangedEmail,
    sendBorrowEmail,
    sendReturnEmail,
    sendDueSoonEmail,
    sendOverdueFineEmail,
    sendReservationAvailableEmail,
    sendReservationExpiredEmail,
};