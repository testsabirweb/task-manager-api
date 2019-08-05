const sgMail = require('@sendgrid/mail')
const my_gmail = 'testsabirweb@gmail.com'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:my_gmail,
        subject:'create user',
        text:` welcome ${name}`////this is not single quote it is back tick  see just left to the key number 1
    })
}

const sendCancellationEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:my_gmail,
        subject:'delete user',
        text:` byee ${name}`
    })
}

module.exports={
    sendWelcomeEmail:sendWelcomeEmail,
    sendCancellationEmail:sendCancellationEmail
}