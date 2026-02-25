import { BrevoProvider } from "~/providers/BrevoProvider";

const sendMailController = async (req, res) => {
  try {
    const { toEmail, subject, htmlContent } = req.body;

    if (!toEmail || !subject || !htmlContent) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // const response = await BrevoProvider.sendEmail(toEmail, subject, htmlContent)
    // console.log('response after sending: ', response)
    await BrevoProvider.sendEmail(toEmail, subject, htmlContent);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully!",
      //data: response
    });
  } catch (error) {
    console.error("Send mail error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};

export const mailController = {
  sendMailController,
};
