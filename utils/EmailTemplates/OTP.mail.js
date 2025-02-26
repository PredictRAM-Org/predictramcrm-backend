const OTPEmail = (senderName, otp) => {
  return {
    subject: `AssetRam CRM - Password Reset OTP Verification Required`,
    html: `
      <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - OTP</title>
</head>

<body style="font-family: Arial, sans-serif;">

    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>AssetRAM CRM - Forgot Password</h2>
        <p>Hello <strong>${senderName},</strong></p>
        <p>You have requested to reset your password for your AssetRam CRM account. Please use the following One-Time Password (OTP) to proceed:</p>
        <p style="background-color: #f0f0f0; padding: 10px; font-size: 18px; font-weight: bold;">${otp}</p>
        <p>If you did not request this, you can safely ignore this email. The OTP will expire after a certain period of time.</p>
        <p>Thank you for choosing AssetRam CRM!</p>
    </div>

</body>

</html>


      `,
  };
};

module.exports = OTPEmail;
