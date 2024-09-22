const axios = require("axios");

let conversationHistory = {};

module.exports = {
    config: {
        name: "principe",
        author: "Bruno",
        version: "1.0.0",
        countDown: 5,
        role: 0,
        category: "Ai",
        shortDescription: {
            en: "Automatic Image/Text Response Bot"
        }
    },

    onStart: async function (userId, prompt, sendResponse) {
        try {
            const isImage = prompt.startsWith("image:");
            if (isImage) {
                const imageUrl = prompt.split("image:")[1].trim();
                const immediateResponse = "✨ Photo reçue avec succès ! ✨\nL'image montre une capture d'écran d'un téléphone portable. ..."; // Détails de l'image
                sendResponse(immediateResponse);
                
                // Mettez à jour l'historique de la conversation
                conversationHistory[userId] = conversationHistory[userId] || [];
                conversationHistory[userId].push({ prompt: "Image reçue", link: imageUrl });

                // Traitez l'image avec l'API
                const response = await axios.post(`https://gemini-ap-espa-bruno.onrender.com/api/gemini`, {
                    prompt: "Traite l'image",
                    customId: userId,
                    link: imageUrl
                });

                // Ajoutez la réponse de l'API à l'historique
                conversationHistory[userId].push({ response: response.data.message });
                return;
            }

            // Gestion des prompts normaux
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://gemini-ap-espa-bruno.onrender.com/api/gemini?ask=${encodedPrompt}`;

            const response = await axios.get(apiUrl);
            if (response.data && response.data.message) {
                sendResponse(response.data.message);
            } else {
                sendResponse("Impossible d'obtenir une réponse.");
            }
        } catch (error) {
            console.error('Erreur lors de la requête API:', error.message);
            sendResponse("Une erreur est survenue lors du traitement de votre requête.");
        }
    }
};
