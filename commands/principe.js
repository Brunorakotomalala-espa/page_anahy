const axios = require("axios");

// ID de l'administrateur (remplacez par le vrai ID)
const ADMIN_ID = "100041841881488"; // Remplacez par l'ID réel de l'administrateur

// Dictionnaire pour stocker l'historique des conversations par utilisateur
let conversationHistory = {};
let imageCache = {}; // Stocker l'image temporairement par utilisateur

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

    onStart: async function (userId, prompt, sendResponse, api) {
        try {
            if (!prompt) {
                return sendResponse("Veuillez fournir une commande après principe.");
            }

            // Vérifier si une image est fournie dans le prompt
            const isImage = prompt.toLowerCase().includes("image");
            if (isImage) {
                // Si une image a été reçue précédemment, traiter l'image
                const imageUrl = imageCache[userId];
                if (imageUrl) {
                    conversationHistory[userId] = conversationHistory[userId] || { prompts: [], lastResponse: "" };
                    conversationHistory[userId].prompts.push({ prompt: "Image reçue", link: imageUrl });

                    const response = await axios.post(`https://gemini-ap-espa-bruno.onrender.com/api/gemini`, {
                        prompt: prompt,
                        customId: userId,
                        link: imageUrl
                    });

                    conversationHistory[userId].lastResponse = response.data.message;
                    sendResponse(`✨ Photo reçue avec succès ! ✨\n${response.data.message}`);
                    delete imageCache[userId]; // Supprimer l'image après traitement
                    return;
                }
            }

            // Si le prompt ne contient pas d'image, envoyer une requête normale
            const encodedPrompt = encodeURIComponent(prompt);
            const apiUrl = `https://gemini-ap-espa-bruno.onrender.com/api/gemini?ask=${encodedPrompt}`;

            const response = await axios.get(apiUrl);
            if (response.data && response.data.message) {
                sendResponse(response.data.message); // Utiliser la fonction de rappel pour envoyer la réponse
            } else {
                sendResponse("Impossible d'obtenir une réponse.");
            }
        } catch (error) {
            console.error('Erreur lors de la requête API:', error.message);
            sendResponse("Une erreur est survenue lors du traitement de votre requête.");
        }
    }
};
