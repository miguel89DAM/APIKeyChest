const nodemailer = require("nodemailer");
const {google} = require('googleapis');
const dotenv = require("dotenv");
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN});
async function sendEmail(to, token,text)  {
    try { 
        //const accessToken = await oAuth2Client.getAccessToken();
        const accessToken = await new Promise((resolve, reject) => {
            oAuth2Client.getAccessToken((err, token) => {
              if (err) {
                reject(err);
              }
              resolve(token);
            });
        });

        const transport = nodemailer.createTransport({
            service:'gmail',
            auth:{
                type: 'OAuth2',
                user:process.env.EMAIL_USER,
                accessToken:accessToken,
                clientId:process.env.CLIENT_ID,
                clientSecret:process.env.CLIENT_SECRET,
                refreshToken:process.env.REFRESH_TOKEN

            }
        });

        const mailOptions={
            from:process.env.EMAIL_USER,
            to:to,
            subject:'Email verification',
            text:text
        };

        const result= await transport.sendMail(mailOptions) 
        return result;

    }catch(error){
        return error;
    }
};


module.exports = {sendEmail};