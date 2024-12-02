

const verifyEmailTemplate = ({ name, url }) => {
    return `
    <p>Dear ${name}</p>
    <p>Thanks for Registering.</p>

    <a  href=${url}
    style="padding:5px ;background:blue;color:white; margin-top:10px">
    Verify Email
    </a>
       
    `

}

export default verifyEmailTemplate;