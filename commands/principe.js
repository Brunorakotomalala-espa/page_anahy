const axios = require("axios");

// Dictionnaire pour stocker l'historique des conversations par utilisateur
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
            // Initialisation de l'historique de conversation si nécessaire
            if (!conversationHistory[userId]) {
                conversationHistory[userId] = { prompts: [], lastResponse: "" };
            }

            // Vérifier si le prompt est une image
            const isImage = prompt.startsWith("image:");
            if (isImage) {
                const imageUrl = prompt.split("image:")[1].trim();
                conversationHistory[userId].prompts.push({ prompt: "Image reçue", link: imageUrl });

                const response = await axios.post(`https://gemini-ap-espa-bruno.onrender.com/api/gemini`, {
                    prompt: "Traite l'image",
                    customId: userId,
                    link: imageUrl
                });

                conversationHistory[userId].lastResponse = response.data.message;
                sendResponse(`✨ Photo reçue avec succès ! ✨\n${response.data.message}`);
                return;
            }

            // Si c'est une demande de détails
            if (prompt.toLowerCase().includes("plus de détails")) {
                if (conversationHistory[userId].lastResponse) {
                    sendResponse(`Voici plus de détails : ${conversationHistory[userId].lastResponse}`);
                    return;
                } else {
                    sendResponse("Désolé, je n'ai pas d'informations supplémentaires sur cette image.");
                    return;
                }
            }

            // Si ce n'est pas une image, gérer comme un prompt normal
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://gemini-ap-espa-bruno.onrender.com/api/gemini?ask=${encodedPrompt}`;

            const response = await axios.get(apiUrl);
            if (response.data && response.data.message) {
                conversationHistory[userId].prompts.push({ prompt });
                conversationHistory[userId].lastResponse = response.data.message;
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
