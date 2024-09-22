const fs = require('fs');
const path = require('path');

// Charger toutes les commandes dans le répertoire commands
const commands = {};
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands[command.config.name] = command;
}

module.exports = function handleMessage(sender_psid, received_message, callSendAPI) {
    // Vérifier si le message contient du texte
    if (received_message.text) {
        const messageText = received_message.text.toLowerCase();

        // Extraire la commande et les arguments
        const [commandName, ...args] = messageText.split(' ');

        // Vérifier si la commande existe dans les fichiers du répertoire commands
        if (commands[commandName]) {
            const command = commands[commandName];

            // Appeler la fonction onStart de la commande correspondante avec les paramètres simplifiés
            command.onStart(sender_psid, args.join(' '), (responseText) => {
                callSendAPI(sender_psid, { text: responseText }); // Envoyer la réponse au bot
            });
        } else {
            // Si la commande n'existe pas, envoyer une réponse par défaut
            const response = {
                text: `La commande "${commandName}" n'existe pas. Essayez une commande valide.`
            };
            callSendAPI(sender_psid, response);
        }
    }
};
