import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (email, otp, purpose) => {
  await transport.sendMail({
    from: `Assets & Appraisal Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject:
      purpose === "reset" ? "Reset Your Password" : "Verify Your Admin Account",
    html: `
      <h2>${purpose === "reset" ? "Password Reset" : "Email Verification"}</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>OTP valid for 10 minutes.</p>
    `,
  });
};
