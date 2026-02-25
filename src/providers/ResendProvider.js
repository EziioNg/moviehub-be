import { Resend } from "resend";

import { env } from "~/config/environment";

const RESEND_API_KEY = env.RESEND_API_KEY;
const RESEND_ADMIN_SENDER_EMAIL = env.RESEND_ADMIN_SENDER_EMAIL;

// Tạo 1 instance của Resend để sử dụng
const resendInstance = new Resend(RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resendInstance.emails.send({
      from: RESEND_ADMIN_SENDER_EMAIL,
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    // console.log("resend error: ", error);
    throw error;
  }
};

export const ResendProvider = {
  sendEmail,
};
