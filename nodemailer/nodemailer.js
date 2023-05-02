const nodemailer = require("nodemailer");
const {google} = require('googleapis');
const dotenv = require("dotenv");
dotenv.config();




const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN});

async function sendEmail(to, token)  {
    try {
        
        //console.log(oAuth2Client);
        const accessToken = await oAuth2Client.getAccessToken();
        console.log(accessToken);
        const transport = nodemailer.createTransport({
            service:'gmail',
            auth:{
                type: 'OAuth2',
                user:process.env.EMAIL_USER,
                clientId:process.env.CLIENT_ID,
                clientSecret:process.env.CLIENT_SECRET,
                refreshToken:process.env.REFRESH_TOKEN,
                accessToken:accessToken

            }
        });

        const mailOptions={
            from:process.env.EMAIL_USER,
            to:to,
            subject:'Email verification',
            text:`Hi! There, You have recently visited 
            our website and entered your email.
            Please follow the given link to verify your email
            https://www.keychest.org:3300/users/verify/${token} 
            Thanks`
            //html:'<h1>Hola mundo</h1>'
        };

        const result= await transport.sendMail(mailOptions) 
        return result;

    }catch(error){
        return error;
    }
};


module.exports = {sendEmail};