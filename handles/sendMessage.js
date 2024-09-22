const axios = require('axios');

function sendMessage(senderPsid, responseText) {
    const requestBody = {
        recipient: {
            id: senderPsid
        },
        message: {
            text: responseText
        }
    };

    axios({
        method: 'POST',
        url: `https://graph.facebook.com/v11.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
        data: requestBody
    }).then(response => {
        console.log('Message sent!');
    }).catch(error => {
        console.error('Error sending message:', error);
    });
}

module.exports = sendMessage;
