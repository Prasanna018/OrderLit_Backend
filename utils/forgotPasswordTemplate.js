

function forgotPasswordTemplate({ name, otp }) {
    return `
    <div>
    <p>Dear ${name}</p>
    <p>forgot your password with below otp before 1 hour</p>
    </br>
    </br>
    <div style="background:yellow;font-size:20px">
    ${otp}
    </div>

    </div>
    
    
    `



}

export default forgotPasswordTemplate
