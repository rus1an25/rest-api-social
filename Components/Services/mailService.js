const nodemailer = require('nodemailer');
const path = require("path");

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            tls:{
                rejectUnauthorized: false
            },
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    async sendActivationMail (to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Social complete registration`,
            text: '',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body style="color: rgba(0,0,0,.65); font-size: 16px;">
    <div class="container" style="height: 100vh; max-width: 996px; margin: 0 auto; text-align: center;">
        <div class="header">
            <h1>Thank you for registering on Social!</h1>
        </div>
        <div class="content" style="font-size: 1.25rem;">
            <div class="message" style="margin-bottom: 0.5rem;">
                <span style="display: block;">The last step is left...</span>
                <span style="    margin-bottom: 0.25rem;">To complete registration and activate your account, follow the link:</span>
            </div>
            <div class="link" style="margin-bottom: 0.5rem;"><a href=${link}>${link}</a></div>
        </div>
    </div>
</body>
</html>`
        })
    }
}

module.exports = new MailService();