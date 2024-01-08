const otpGenerator = require('otp-generator')

const alphanumericOTP = otpGenerator.generate(6, { digits: true,lowerCaseAlphabets:false ,upperCaseAlphabets:false,specialChars:false});
const numericOTP = parseInt(alphanumericOTP.match(/\d+/)[0], 10);

console.log(alphanumericOTP)
console.log(numericOTP)

