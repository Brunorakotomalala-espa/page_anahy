const sendMessage = require('./sendMessage');

function handlePostback(event) {
    const senderPsid = event.sender.id;
    const postbackPayload = event.postback.payload;

    if (postbackPayload === 'GET_STARTED') {
        sendMessage(senderPsid, "Welcome! How can I assist you today?");
    }
}

module.exports = handlePostback;
