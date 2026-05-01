const path = require("path");
const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

class Email {
  constructor(user, url = "") {
    this.to = user.email;
    this.firstName = user.name ? user.name.split(" ")[0] : "there";
    this.url = url;
    this.from = `EventFlow <${process.env.EMAIL_FROM}>`;
  }

  _createTransport() {
    if (process.env.NODE_ENV === "production") {
      // Production: use real SMTP (configure SMTP_HOST etc in .env for production)
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
        port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USERNAME,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
        },
      });
    }
    // Development: Mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async _send(template, subject, locals = {}) {
    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      "emails",
      `${template}.pug`,
    );

    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      subject,
      ...locals,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html, { wordwrap: 130 }),
    };

    await this._createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this._send("welcome", "Welcome to EventFlow! 🎉", {
      email: this.to,
      browseUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/events`,
      role: this._role || "user",
    });
  }

  async sendTwoFactorCode(otp) {
    await this._send("twoFactor", "Your EventFlow verification code", { otp });
  }

  async sendPasswordReset() {
    await this._send(
      "passwordReset",
      "Reset your EventFlow password (valid 10 min)",
      { resetURL: this.url },
    );
  }

  async sendBookingConfirmation(details) {
    await this._send(
      "bookingConfirmation",
      `Booking confirmed: ${details.eventTitle}`,
      {
        ...details,
        dashboardUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-tickets`,
      },
    );
  }

  async sendEventStatus(details) {
    await this._send("eventStatus", `Your event has been ${details.status}`, {
      ...details,
      eventUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/events/${details.eventId}`,
    });
  }
}

// --- Legacy helper (keeps existing forgotPassword etc working) ---
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `EventFlow <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  });
};

module.exports = { Email, sendEmail };
