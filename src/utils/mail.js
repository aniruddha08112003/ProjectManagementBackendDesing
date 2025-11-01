import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options)=>{
   const mailGenerator =  new Mailgen({
        theme: "default",
        product:{
            name: "Task Manager",
            link: "https://taskManagerlink.com"
        }
    })

   const emailTextual =  mailGenerator.generatePlaintext(options.mailgenContent);
   const emailHtml = mailGenerator.generate(options.mailgenContent);

   const transporter = nodemailer.createTransport({
     host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        }
   })

   const mail = {
    from : "mail.taskmanager@example.com",
    to : options.email,
    subject : options.subject,
    text : emailTextual,
    html : emailHtml

   }

   try {
    await transporter.sendMail(mail);
   } catch (error) {
    console.error("Email failed silently make sure to enter correct MAILTRAP credentials in .env file");
    console.error("Error: ",error);
   }
}


const emailVerificationMailgenContent = (username,verificationUrl)=>{
    return{
        body:{
            name: username,
            intro: 'Welcome to Our Application! We\'re very excited to have you on board.',
            action:{
                instructions: 'To verify your email, please click here:',
                button:{
                    color: '#22BC66',
                    text: 'Verify Your Email',
                    link: verificationUrl
                }
            },
            outro: 'If you didn\'t create an account, you can safely delete this email.'
        }
    }
}


const forgotPasswordMailgenContent = (username,resetUrl)=>{
    return{
        body:{
            name: username,
            intro: 'You have requested to reset your password.',
            action:{
                instructions: 'To reset your password, please click here:',
                button:{
                    color: '#FF6136',
                    text: 'Reset Your Password',
                    link: resetUrl
                }
            },
            outro: 'If you did not request a password reset, please ignore this email.'
       } 
   }
}


export {emailVerificationMailgenContent,forgotPasswordMailgenContent, sendEmail};