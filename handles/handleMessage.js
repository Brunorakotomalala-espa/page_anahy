const fs = require('fs');
const path = require('path');

const commands = {};
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

// Charger toutes les commandes
for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands[command.config.name] = command;
}

// Objet pour garder une trace des utilisateurs et de leur commande active
const userSessions = {};

module.exports = function handleMessage(sender_psid, received_message, callSendAPI) {
    if (received_message.text) {
        const messageText = received_message.text.toLowerCase();

        // Vérifier si l'utilisateur a une session active
        if (userSessions[sender_psid]) {
            const activeCommand = userSessions[sender_psid];
            const command = commands[activeCommand];

            if (command) {
                // Traiter le message avec la commande active
                command.onStart(sender_psid, messageText, (responseText) => {
                    callSendAPI(sender_psid, { text: responseText });
                });
            } else {
                callSendAPI(sender_psid, { text: "Commande active non reconnue." });
            }
        } else {
            // Vérifier si le message commence par une commande
            const [commandName, ...args] = messageText.split(' ');

            if (commands[commandName]) {
                const command = commands[commandName];
                userSessions[sender_psid] = commandName; // Enregistrer la commande active
                command.onStart(sender_psid, args.join(' '), (responseText) => {
                    callSendAPI(sender_psid, { text: responseText });
                });
            } else {
                // Vérifier si l'utilisateur demande une réinitialisation
                if (messageText === 'reset') {
                    delete userSessions[sender_psid]; // Réinitialiser la session de l'utilisateur
                    callSendAPI(sender_psid, { text: "Commande réinitialisée. Veuillez entrer une nouvelle commande." });
                } else {
                    callSendAPI(sender_psid, { text: `La commande "${commandName}" n'existe pas. Essayez une commande valide.` });
                }
            }
        }
    }
};

