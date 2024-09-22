const sendMessage = require('./sendMessage');

function handleMessage(event) {
    const senderPsid = event.sender.id;
    const receivedMessage = event.message;

    if (receivedMessage && receivedMessage.text) {
        const userMessage = receivedMessage.text;
        sendMessage(senderPsid, `You sent the message: "${userMessage}"`);
    }
}

module.exports = handleMessage;
