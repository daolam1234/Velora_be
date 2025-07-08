import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, html }) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME, 
        pass: process.env.MAIL_PASSWORD, 
      },
    });

    const mailOptions = {
      from: `"Velora Shop 👟" <${process.env.MAIL_USERNAME}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error("Gửi mail thất bại:", error);
  }
};
