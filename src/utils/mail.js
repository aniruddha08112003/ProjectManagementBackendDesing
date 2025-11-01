import Mailgen from "mailgen";

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


export {emailVerificationMailgenContent,forgotPasswordMailgenContent}