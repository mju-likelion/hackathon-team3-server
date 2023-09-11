export class EmailCreator {
  createVerificationEmail(verificationToken: string, expirationTime: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>이메일 인증</title>
        <style>
            /* 추가적인 스타일링을 여기에 추가할 수 있습니다. */
        </style>
      </head>
      <body style="text-align: center; padding: 20px;">
        <h1>이메일 인증</h1>
        <p>아래 버튼을 클릭하여 이메일 인증을 완료하세요.</p>
        <a href="${verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">인증하기</a>
        <p>이 메일은 ${expirationTime}분 동안 유효합니다.</p>
      </body>
      </html>
    `;
  }
}
