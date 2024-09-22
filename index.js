require('dotenv').config();  // Charger les variables d'environnement à partir du fichier .env
const express = require('express');
const bodyParser = require('body-parser');
const handleMessage = require('./handles/handleMessage');
const handlePostback = require('./handles/handlePostback');
const axios = require('axios');  // Pour les requêtes HTTP

const app = express();
app.use(bodyParser.json());

// PAGE_ACCESS_TOKEN depuis les variables d'environnement
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Fonction pour envoyer un message via l'API Messenger
function callSendAPI(sender_psid, response) {
    const request_body = {
        recipient: {
            id: sender_psid
        },
        message: response
    };

    // Envoyer le message à l'API Messenger
    axios.post(`https://graph.facebook.com/v13.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body)
        .then(response => {
            console.log('Message envoyé avec succès');
        })
        .catch(error => {
            console.error('Impossible d\'envoyer le message :', error);
        });
}

// Webhook route pour traiter les messages entrants
app.post('/webhook', (req, res) => {
    const body = req.body;

    // Vérifier si l'événement provient d'une page Facebook
    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const webhookEvent = entry.messaging[0];
            const sender_psid = webhookEvent.sender.id;

            // Gérer le message reçu
            if (webhookEvent.message) {
                handleMessage(sender_psid, webhookEvent.message, callSendAPI);
            }
            // Gérer le postback reçu
            else if (webhookEvent.postback) {
                handlePostback(sender_psid, webhookEvent.postback, callSendAPI);
            }
        });

        // Réponse HTTP 200 pour valider que l'événement a été reçu
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Réponse HTTP 404 si l'événement ne provient pas d'une page
        res.sendStatus(404);
    }
});

// Route pour vérifier le webhook lors de la configuration
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
