const SibApiV3Sdk = require("@getbrevo/brevo");
import { env } from "~/config/environment";

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  // khởi tạo 1 sendSmtpEmail để gửi email
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  // tài khoản gửi email: email brevo
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  };

  // tài khoản nhận
  sendSmtpEmail.to = [{ email: recipientEmail }];

  // tiêu đề email
  sendSmtpEmail.subject = customSubject;

  // nội dung email
  sendSmtpEmail.htmlContent = customHtmlContent;

  // gọi hành động gửi email
  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

export const BrevoProvider = {
  sendEmail,
};
