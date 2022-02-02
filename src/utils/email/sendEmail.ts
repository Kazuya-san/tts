const sendEmail = (emailconfig: any) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
    var urlencoded = new URLSearchParams();
    urlencoded.append("to", emailconfig.to);
    urlencoded.append("from", emailconfig.from);
    urlencoded.append("subject", emailconfig.subject);
    urlencoded.append("text", emailconfig.text);
    urlencoded.append("html", emailconfig.html);

    
    var requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      
      redirect: 'follow'
    };
    
    fetch("api/sendemail/sendemail", requestOptions)
      .then(res => console.log(res))
      .catch(error => console.log(error));
} 

export default sendEmail;