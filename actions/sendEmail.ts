import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

//SMTPサーバの設定
const transport = nodemailer.createTransport({
  pool: true,
  service: "gmail",
  port: 465,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
  maxConnections: 1,
});

export const sendEmail = async (
  subject: string,
  body: string,
  sendTo: string,
) => {
  const mailOptions: Mail.Options = {
    from: process.env.NODEMAILER_EMAIL,
    to: sendTo,
    subject: subject,
    html: body,
  };

  try {
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.log(error);

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "メールの送信に失敗しました",
    });
  }
};
