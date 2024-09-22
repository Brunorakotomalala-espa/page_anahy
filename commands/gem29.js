const axios = require('axios');

module.exports = {
    config: {
        name: "gem29",
        author: "cliff",
        version: "1.0.0",
        countDown: 5,
        role: 0,
        category: "Ai",
        shortDescription: {
            en: "{p}mixtral"
        }
    },
    onStart: async function (userId, prompt, sendResponse) {
        try {
            if (!prompt) {
                return sendResponse("Veuillez fournir une commande après gem29.");
            }

            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://gem2-9b-it-njiv.vercel.app/api?ask=${encodedPrompt}`;

            const response = await axios.get(apiUrl);

            if (response.data && response.data.response) {
                sendResponse(response.data.response); // Utiliser la fonction de rappel pour envoyer la réponse
            } else {
                sendResponse("Impossible d'obtenir une réponse.");
            }
        } catch (error) {
            console.error('Erreur lors de la requête API Llama:', error.message);
            sendResponse("Une erreur est survenue lors du traitement de votre requête.");
        }
    }
};
