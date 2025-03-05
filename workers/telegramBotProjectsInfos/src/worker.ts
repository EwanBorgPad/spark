import { Bot, webhookCallback, Context, session, SessionFlavor, InlineKeyboard, InputFile } from "grammy";
import { FileAdapter } from "@grammyjs/storage-file";
import { D1Database, ExecutionContext, KVNamespace } from "@cloudflare/workers-types";
import { R2Bucket } from "@cloudflare/workers-types";

// Interfaces
interface Env {
    BOT_TOKEN: string;
    TWITTER_CLIENT_ID: string;
    TWITTER_CLIENT_SECRET: string;
    TWITTER_CALLBACK_URL: string;
    SESSION_STORE: KVNamespace;
    DB: D1Database;
    BUCKET: R2Bucket;
    BUCKET_URL: string;
    CREATE_PROJECT_API_URL: string;
    CREATE_PROJECT_API_KEY: string;
    BOT_USERNAME: string;
    TELEGRAM_THREAD_ID: number;
}

interface UserAnswers {
    twitterConnected?: boolean;
    twitterUsername?: string;
    projectName?: string;
    description?: string;
    projectPicture?: string;
    thumbnailPicture?: string;
    websiteLink?: string;
    communityLink?: string;
    xLink?: string;
    chain?: string;
    sector?: string;
    vesting?: string;
    fdvMin?: string;
    fdvMax?: string;
    fdv?: string;
    ticker?: string;
    tokenPicture?: string;
    dataRoom?: string;
    strengths?: string;
    currentQuestion: number;
}

interface SessionData {
    answers: UserAnswers;
}

type MyContext = Context & SessionFlavor<SessionData>;

// Questions array
const questions = [
    "1/15 - What is your project name? 🏷️",
    "2/15 - One sentence to describe your project 💎 (Max 80 characters)",
    "3/15 - Send your project logo in jpg or png format 🖼️ (optimal size: 200x200px)",
    "4/15 - Send your thumbnail picture in jpg or png format 🖼️ (optimal size: 400x400px)",
    "5/15 - Your website Link 🌐",
    "6/15 - Your telegram OR discord link (your main channel to communicate your community) 💬",
    "7/15 - Your X link 🐦",
    "8/15 - Select the chain you want to deploy on ⛓️",
    "9/15 - What is your sector? 🎯 (Depin / SocialFi / DeFi etc.)",
    "10/15 - What kind of vesting would you prefer? 📅",
    "11.A/15 - At which minimum FDV you want to launch 💰",
    "11.B/15 - At which maximum FDV you want to launch 💰",
    "12/15 - Your token TICKER $XXXXX 🎫 (must start with '$' and be up to 5 characters long in uppercase).",
    "13/15 - Send your token picture in jpg or png format 🖼️ (optimal size: 80x80px)",
    "14/15 - To provide the most information to your investors - and make them want to invest - you need a data room 📚\n\nExamples:\nAmbient: https://borgpad-data-room.notion.site/moemate?pvs=4\nSolana ID: https://www.solana.id/solid\n\nHere is a template: https://docs.google.com/document/d/1j3hxzO8_9wNfWfVxGNRDLFV8TJectQpX4bY6pSxCLGs/edit?tab=t.0\n\nShare the link of your data room 📝",
    "15/15 - What is your biggest strength / differentiating points compared to your potential competitors? 💪"
];

// Storage adapter pour Cloudflare KV
class CloudflareStorage {
    constructor(private namespace: KVNamespace) {}

    async read(key: string) {
        try {
            console.log('Reading session for key:', key);
            const value = await this.namespace.get(key);
            console.log('Read value from KV:', value);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error reading from KV:', error);
            return null;
        }
    }

    async write(key: string, value: any) {
        try {
            console.log('Writing session for key:', key);
            console.log('Writing value:', JSON.stringify(value));
            await this.namespace.put(key, JSON.stringify(value));
            // Vérification immédiate
            const written = await this.read(key);
            console.log('Verification after write:', written);
        } catch (error) {
            console.error('Error writing to KV:', error);
        }
    }

    async delete(key: string) {
        try {
            await this.namespace.delete(key);
        } catch (error) {
            console.error('Error deleting from KV:', error);
        }
    }
}

// Migration SQL pour créer la table
const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    twitterUsername TEXT,
    projectName TEXT,
    description TEXT,
    projectPicture TEXT,
    thumbnailPicture TEXT,
    websiteLink TEXT,
    communityLink TEXT,
    xLink TEXT,
    chain TEXT,
    sector TEXT,
    vesting TEXT,
    fdv TEXT,
    ticker TEXT,
    tokenPicture TEXT,
    dataRoom TEXT,
    createdAt TEXT
)`;

// Fonction pour poser la question suivante
async function askNextQuestion(ctx: MyContext, env: Env) {
    const currentQuestion = ctx.session.answers.currentQuestion;
    
    if (currentQuestion < questions.length) {
        // Créer les boutons pour les questions spécifiques
        if (currentQuestion === 7) { // Chain question
            const keyboard = new InlineKeyboard()
                .text("Solana 🟪", "chain_Solana")
                .text("Avalanche 🔺", "chain_Avalanche")
                .row()
                .text("Abstract 🟩", "chain_Abstract")
                .text("Base 🟦", "chain_Base")
                .row()
                .text("Sonic 🟡", "chain_Sonic");
            
            await ctx.reply(questions[currentQuestion], { reply_markup: keyboard });
        }
        else if (currentQuestion === 9) { // Vesting question (remplace TGE date)
            const keyboard = new InlineKeyboard()
                .text("6 month vesting", "vesting_6month")
                .row()
                .text("3 month vesting", "vesting_3month")
                .row()
                .text("50% TGE + 2 month", "vesting_50tge");
            
            await ctx.reply(questions[currentQuestion], { reply_markup: keyboard });
        }
        else if (currentQuestion === 10) { // FDV Min
            const keyboard = new InlineKeyboard()
                .text("$1M", "fdvMin_1")
                .text("$5M", "fdvMin_5")
                .text("$10M", "fdvMin_10")
                .row()
                .text("$15M", "fdvMin_15")
                .text("$20M", "fdvMin_20")
                .text("$25M", "fdvMin_25")
                .row()
                .text("$30M", "fdvMin_30")
                .text("$35M", "fdvMin_35")
                .text("$40M", "fdvMin_40")
                .row()
                .text("$45M", "fdvMin_45")
                .text("$50M", "fdvMin_50");
            
            await ctx.reply(questions[currentQuestion], { reply_markup: keyboard });
        }
        else if (currentQuestion === 11) { // FDV Max
            // Récupérer la valeur minimale pour filtrer les options
            const minValue = parseInt(ctx.session.answers.fdvMin || "1");
            
            // Créer un clavier avec seulement les valeurs supérieures au minimum
            const keyboard = new InlineKeyboard();
            
            // Première ligne
            if (5 > minValue) keyboard.text("$5M", "fdvMax_5");
            if (10 > minValue) keyboard.text("$10M", "fdvMax_10");
            if (15 > minValue) keyboard.text("$15M", "fdvMax_15");
            
            // Deuxième ligne (si au moins un bouton a été ajouté à la première ligne)
            if (keyboard.inline_keyboard.length > 0 && keyboard.inline_keyboard[0].length > 0) {
                keyboard.row();
            }
            
            // Ajouter les boutons de la deuxième ligne
            if (20 > minValue) keyboard.text("$20M", "fdvMax_20");
            if (25 > minValue) keyboard.text("$25M", "fdvMax_25");
            if (30 > minValue) keyboard.text("$30M", "fdvMax_30");
            
            // Troisième ligne (si au moins un bouton a été ajouté à la deuxième ligne)
            if (keyboard.inline_keyboard.length > 0 && keyboard.inline_keyboard[keyboard.inline_keyboard.length - 1].length > 0) {
                keyboard.row();
            }
            
            // Ajouter les boutons de la troisième ligne
            if (35 > minValue) keyboard.text("$35M", "fdvMax_35");
            if (40 > minValue) keyboard.text("$40M", "fdvMax_40");
            if (45 > minValue) keyboard.text("$45M", "fdvMax_45");
            
            // Quatrième ligne (si au moins un bouton a été ajouté à la troisième ligne)
            if (keyboard.inline_keyboard.length > 0 && keyboard.inline_keyboard[keyboard.inline_keyboard.length - 1].length > 0) {
                keyboard.row();
            }
            
            // Ajouter le bouton de la quatrième ligne
            if (50 > minValue) keyboard.text("$50M", "fdvMax_50");
            if (75 > minValue) keyboard.text("$75M", "fdvMax_75");
            if (100 > minValue) keyboard.text("$100M", "fdvMax_100");
            
            await ctx.reply(questions[currentQuestion], { reply_markup: keyboard });
        }
        else {
            await ctx.reply(questions[currentQuestion]);
        }
    } else {
        await showSummary(ctx, env);
    }
}

// Modifier la fonction showSummary pour gérer les conflits d'ID
async function showSummary(ctx: MyContext, env: Env) {
    try {
        const answers = ctx.session.answers;
        const userId = ctx.from?.id.toString();
        console.log('Saving data for user:', userId);
        console.log('Answers:', JSON.stringify(answers, null, 2));

        // Vérifier si userId existe
        if (!userId) {
            throw new Error('User ID is undefined');
        }

        // Vérifier si les champs requis sont présents
        if (!answers.twitterUsername) {
            throw new Error('Twitter username is required');
        }
        
        // S'assurer que le champ fdv est correctement défini
        if (answers.fdvMin && answers.fdvMax && !answers.fdv) {
            answers.fdv = `$${answers.fdvMin}M - $${answers.fdvMax}M`;
            console.log('Setting FDV range:', answers.fdv);
        }

        // Sauvegarder dans D1 avec gestion des nulls
        const result = await env.DB.prepare(`
            INSERT INTO projects (
                userId, twitterUsername, projectName, description, 
                projectPicture, thumbnailPicture, websiteLink, communityLink, xLink,
                chain, sector, vesting, fdv, ticker, tokenPicture,
                dataRoom, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
            userId,
            answers.twitterUsername || '',
            answers.projectName || '',
            answers.description || '',
            answers.projectPicture || '',
            answers.thumbnailPicture || '',
            answers.websiteLink || '',
            answers.communityLink || '',
            answers.xLink || '',
            answers.chain || '',
            answers.sector || '',
            answers.vesting || '',
            answers.fdv || '',
            answers.ticker || '',
            answers.tokenPicture || '',
            answers.dataRoom || ''
        ).run();

        console.log('DB insert result:', result);

        // Formater l'ID du projet (uniquement lettres minuscules, chiffres et tirets)
        let formattedProjectId = answers.projectName
            ? answers.projectName
                .toLowerCase()                     // Convertir en minuscules
                .replace(/\s+/g, '-')             // Remplacer les espaces par des tirets
                .replace(/[^a-z0-9-]/g, '')       // Supprimer tous les caractères spéciaux
                .replace(/-+/g, '-')              // Remplacer les tirets multiples par un seul
                .replace(/^-|-$/g, '')            // Supprimer les tirets au début et à la fin
            : `project-${Date.now()}`;            // Fallback si le nom du projet est vide
        
        console.log('Initial formatted project ID:', formattedProjectId);

        // Modifier la fonction createAndSendProjectJson pour corriger les erreurs de validation
        const createAndSendProjectJson = async (projectId: string, retryCount = 0): Promise<any> => {
            // Créer l'objet JSON au format souhaité, aligné avec les exemples
            const projectJson = {
                id: projectId,
                config: {
                    cluster: "mainnet",
                    lpPositionToBeBurned: true,
                    raiseTargetInUsd: 100000,
                    fdv: parseInt(answers.fdvMin || '0') * 1000000, // Utiliser fdvMin pour le calcul
                    marketCap: 0,
                    totalTokensForLiquidityPool: 14285714,
                    totalTokensForRewardDistribution: 14285714,
                    rewardsDistributionTimeInMonths: 6,
                    finalSnapshotTimestamp: null,
                    lbpWalletAddress: null,
                    raisedTokenData: {
                        iconUrl: "https://files.borgpad.com/usdc-logo.png",
                        ticker: "USDC",
                        mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                        decimals: 6,
                        fixedTokenPriceInUsd: 1,
                        coinGeckoName: "usd"
                    },
                    launchedTokenData: {
                        iconUrl: answers.tokenPicture || "",
                        ticker: answers.ticker?.replace('$', '') || "",
                        mintAddress: null,
                        decimals: 0,
                        fixedTokenPriceInUsd: 0
                    }
                },
                info: {
                    claimUrl: null,
                    tweetUrl: null,
                    tokenContractUrl: null,
                    poolContractUrl: null,
                    projectType: "draft-pick",
                    title: answers.projectName || "",
                    subtitle: answers.description || "",
                    logoUrl: answers.projectPicture || "",
                    thumbnailUrl: answers.thumbnailPicture || "",
                    squaredThumbnailUrl: answers.thumbnailPicture || "",
                    origin: "The Singularity",
                    sector: answers.sector || "",
                    tokenGenerationEventDate: "TBD",
                    targetFdv: answers.fdv || `$${answers.fdvMin || '0'}M - $${answers.fdvMax || '0'}M`,
                    targetVesting: answers.vesting || "",
                    chain: {
                        name: answers.chain || "Solana",
                        iconUrl: "https://files.borgpad.com/images/zkagi/solana-small.jpg"
                    },
                    dataRoom: {
                        backgroundImgUrl: "",
                        url: answers.dataRoom || ""
                    },
                    liquidityPool: {
                        name: "Raydium",
                        iconUrl: "https://files.borgpad.com/images/shared/raydium-logo-small.png",
                        lbpType: "Mixte",
                        lockingPeriod: "∞"
                    },
                    curator: {
                        avatarUrl: "",
                        fullName: "TBD",
                        position: "TBD",
                        socials: [
                            {
                                url: answers.websiteLink || "https://borgpad.com",
                                iconType: "WEB",
                                label: "Web"
                            },
                            {
                                url: answers.xLink || "https://x.com/borgpad",
                                iconType: "X_TWITTER",
                                label: "X (ex-Twitter)"
                            }
                        ]
                    },
                    projectLinks: [
                        {
                            url: answers.websiteLink || "https://borgpad.com",
                            iconType: "WEB",
                            label: ""
                        },
                        {
                            url: answers.communityLink || "https://t.me/borgpad",
                            iconType: "TELEGRAM",
                            label: ""
                        },
                        {
                            url: answers.xLink || "https://x.com/borgpad",
                            iconType: "X_TWITTER",
                            label: ""
                        }
                    ],
                    timeline: [
                        {
                            id: "REGISTRATION_OPENS",
                            date: null,
                            label: "Registration Opens"
                        },
                        {
                            id: "SALE_OPENS",
                            date: null,
                            label: "Sale Opens"
                        },
                        {
                            id: "SALE_CLOSES",
                            date: null,
                            label: "Sale Closes"
                        },
                        {
                            id: "REWARD_DISTRIBUTION",
                            date: null,
                            label: "Reward Distribution"
                        },
                        {
                            id: "DISTRIBUTION_OVER",
                            date: null,
                            label: "Distribution Over"
                        }
                    ],
                    tiers: [
                        {
                            id: "tier30",
                            label: "BORGers Club",
                            description: "",
                            questsOperator: "AND",
                            quests: [
                                {
                                    type: "HOLD_TOKEN",
                                    tokenMintAddress: "3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z",
                                    tokenName: "BORG",
                                    tokenAmount: "1000"
                                }
                            ],
                            benefits: {
                                startDate: "2025-12-31T23:59:59.000Z",
                                minInvestment: "100",
                                maxInvestment: "2500"
                            }
                        },
                        {
                            id: "tier99",
                            label: "Public Sale",
                            description: "",
                            questsOperator: "AND",
                            quests: [],
                            benefits: {
                                startDate: "2025-12-31T23:59:59.000Z",
                                minInvestment: "10",
                                maxInvestment: "2500"
                            }
                        }
                    ]
                }
            };

            console.log('Sending project data to external API');
            console.log('Project JSON ID:', projectJson.id);
            
            try {
                // Construire l'URL complète de l'API
                const apiUrl = `${env.CREATE_PROJECT_API_URL}/projects/propose`;
                console.log('API URL:', apiUrl);
                
                const apiResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': env.CREATE_PROJECT_API_KEY
                    },
                    body: JSON.stringify(projectJson)
                });
                
                if (apiResponse.status === 409) {
                    // Conflit d'ID - l'ID est déjà pris
                    console.log('ID conflict detected (409)');
                    
                    // Limiter le nombre de tentatives
                    if (retryCount >= 5) {
                        throw new Error('Maximum retry attempts reached for ID conflict');
                    }
                    
                    // Générer un nouvel ID avec un nombre à la fin
                    const newProjectId = `${projectId}-${retryCount + 1}`;
                    console.log('Retrying with new ID:', newProjectId);
                    
                    // Réessayer avec le nouvel ID
                    return await createAndSendProjectJson(newProjectId, retryCount + 1);
                }
                
                if (!apiResponse.ok) {
                    const errorText = await apiResponse.text();
                    console.error('API error:', apiResponse.status, errorText);
                    throw new Error(`API error: ${apiResponse.status} ${errorText}`);
                }
                
                const apiResult = await apiResponse.json();
                console.log('API response:', apiResult);
                
                // Optionnel : Sauvegarder l'ID de projet retourné par l'API
                if (apiResult.id) {
                    await env.DB.prepare(`
                        UPDATE projects SET apiProjectId = ? WHERE projectName = ?
                    `).bind(apiResult.id, answers.projectName).run();
                }
                
                return apiResult;
            } catch (error) {
                console.error('Error in createAndSendProjectJson:', error);
                throw error;
            }
        };

        // Envoyer le JSON à l'API externe avec gestion des conflits d'ID
        try {
            await createAndSendProjectJson(formattedProjectId);
        } catch (apiError) {
            console.error('Error calling external API:', apiError);
            // Continuer malgré l'erreur API pour ne pas bloquer l'utilisateur
        }

        const summary = `
📋 Project Summary:

🏷️ Project Name: ${answers.projectName}
💎 Description: ${answers.description}
🖼️ Project Picture: ${answers.projectPicture ? 'Saved ✅' : 'Not provided'}
🖼️ Thumbnail Picture: ${answers.thumbnailPicture ? 'Saved ✅' : 'Not provided'}
🌐 Website: ${answers.websiteLink}
💬 Community Link: ${answers.communityLink}
🐦 X Link: ${answers.xLink}
⛓️ Chain: ${answers.chain}
🎯 Sector: ${answers.sector}
📅 Vesting: ${answers.vesting}
💰 FDV: ${answers.fdv}
🎫 Token Ticker: ${answers.ticker}
🖼️ Token Picture: ${answers.tokenPicture ? 'Saved ✅' : 'Not provided'}
📚 Data Room: ${answers.dataRoom}
💪 Strengths: ${answers.strengths || 'Not provided'}

🎉 Thank you for providing all the information!

You will be reached asap by our team  ! 💚
`;

        // Après avoir sauvegardé dans la base de données
        const notificationGroupId = "-1002474316235"; // ID du supergroupe
        const botAlerteThreadId = env.TELEGRAM_THREAD_ID; // ID du topic "Bot Alerte"
        
        // Récupérer le nom d'utilisateur Telegram
        const telegramUsername = ctx.from?.username || "Unknown";
        
        const notificationMessage = `
🎉 New project submitted !

🏷️ Project : ${answers.projectName}
👤 By : @${telegramUsername}
👤 X account : https://x.com/${answers.twitterUsername}
💎 Description : ${answers.description}
⛓️ Chain : ${answers.chain}
🎯 Sector : ${answers.sector}
📅 Vesting : ${answers.vesting}
💰 FDV : ${answers.fdv}
🎫 Token : ${answers.ticker}

🌐 Website : ${answers.websiteLink}
💬 Community : ${answers.communityLink}
🐦 X : ${answers.xLink}
📚 Data Room : ${answers.dataRoom}
💪 Strengths : ${answers.strengths || 'Not provided'}
`;

        try {
            await ctx.api.sendMessage(notificationGroupId, notificationMessage, {
                message_thread_id: botAlerteThreadId // Spécifier le topic
            });
            console.log('Notification sent to Bot Alerte topic');
        } catch (error) {
            console.error('Error sending notification to group:', error);
        }

        await ctx.reply(summary);
    } catch (error) {
        console.error('Error in showSummary:', error);
        await ctx.reply("An error occurred while saving your project.");
    }
}

// Fonction pour obtenir les dimensions de l'image
async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Vérifier si c'est un PNG
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            const width = buffer[16] * 256 * 256 * 256 + buffer[17] * 256 * 256 + buffer[18] * 256 + buffer[19];
            const height = buffer[20] * 256 * 256 * 256 + buffer[21] * 256 * 256 + buffer[22] * 256 + buffer[23];
            return { width, height };
        }
        // Vérifier si c'est un JPEG
        else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
            let pos = 2;
            while (pos < buffer.length) {
                if (buffer[pos] !== 0xFF) break;
                if (buffer[pos + 1] === 0xC0 || buffer[pos + 1] === 0xC2) {
                    const height = buffer[pos + 5] * 256 + buffer[pos + 6];
                    const width = buffer[pos + 7] * 256 + buffer[pos + 8];
                    return { width, height };
                }
                pos += 2 + buffer[pos + 2] * 256 + buffer[pos + 3];
            }
        }
        throw new Error('Unsupported image format. Please use PNG or JPEG.');
    } catch (error) {
        console.error('Error getting image dimensions:', error);
        throw new Error('Could not determine image dimensions');
    }
}

// Fonction pour redimensionner l'image via un service d'URL avec des contraintes spécifiques
async function resizeImageWithService(imageUrl: string, width: number, height: number, isThumbnail: boolean, isSquare: boolean): Promise<ArrayBuffer> {
    try {
        // Utiliser images.weserv.nl, un service de transformation d'images
        const serviceUrl = new URL('https://images.weserv.nl/');
        
        // Ajouter l'URL de l'image source
        serviceUrl.searchParams.append('url', imageUrl);
        
        // Ajouter les paramètres de redimensionnement
        if (isThumbnail) {
            // Pour les thumbnails, on veut respecter le ratio 600x330
            serviceUrl.searchParams.append('w', width.toString());
            serviceUrl.searchParams.append('h', height.toString());
            serviceUrl.searchParams.append('fit', 'cover'); // Recadrer pour remplir exactement les dimensions
            serviceUrl.searchParams.append('a', 'center'); // Centrer le recadrage
        } else if (isSquare) {
            // Pour les logos et tokens, on veut des images carrées
            serviceUrl.searchParams.append('w', width.toString());
            serviceUrl.searchParams.append('h', height.toString());
            serviceUrl.searchParams.append('fit', 'cover'); // Recadrer pour obtenir un carré
            serviceUrl.searchParams.append('a', 'center'); // Centrer le recadrage
        } else {
            // Fallback (ne devrait pas être utilisé)
            serviceUrl.searchParams.append('w', width.toString());
            serviceUrl.searchParams.append('h', height.toString());
            serviceUrl.searchParams.append('fit', 'inside');
        }
        
        // Ajouter des paramètres de qualité
        serviceUrl.searchParams.append('q', '90');
        serviceUrl.searchParams.append('output', 'jpg');
        
        console.log('Resizing image with service:', serviceUrl.toString());
        
        // Récupérer l'image redimensionnée
        const response = await fetch(serviceUrl.toString());
        if (!response.ok) {
            throw new Error(`Failed to resize image: ${response.status} ${response.statusText}`);
        }
        
        return await response.arrayBuffer();
    } catch (error) {
        console.error('Error resizing image with service:', error);
        throw error;
    }
}

// Modifier la fonction handleImage pour supprimer l'utilisation de Cloudflare Images
async function handleImage(ctx: MyContext, env: Env, fileUrl: string, isToken: boolean, isThumbnail: boolean) {
    try {
        console.log('Processing image:', fileUrl);
        console.log('Image type:', isToken ? 'token' : isThumbnail ? 'thumbnail' : 'logo');

        // Vérifier la taille du fichier
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const contentLength = parseInt(response.headers.get('content-length') || '0');
        console.log('Content length:', contentLength);

        const maxSize = 1024 * 1024; // 1 MB
        if (contentLength > maxSize) {
            await ctx.reply("File too large! Please send an image smaller than 1MB 🚫");
            return;
        }

        // Vérifier les dimensions
        const dimensions = await getImageDimensions(fileUrl);
        console.log('Image dimensions:', dimensions);

        // Vérifications des dimensions
        if (!isToken && !isThumbnail) {
            // Pour les logos, taille minimale de 120x120
            if (dimensions.width < 120 || dimensions.height < 120) {
                await ctx.reply(`Logo size is ${dimensions.width}x${dimensions.height} pixels. Try to not compress the image. Logo must be at least 120x120 pixels! Optimal size is 200x200 pixels. 🎨`);
                return;
            }
        } else if (isThumbnail) {
            // Pour les thumbnails, dimensions minimales de 400x400
            if (dimensions.width < 400 || dimensions.height < 400) {
                await ctx.reply(`Thumbnail size is ${dimensions.width}x${dimensions.height} pixels. Try to not compress the image. Thumbnail must be at least 400x400 pixels! 🖼️`);
                return;
            }
        } else if (isToken) {
            // Pour les tokens, taille minimale de 24x24
            if (dimensions.width < 24 || dimensions.height < 24) {
                await ctx.reply(`Token size is ${dimensions.width}x${dimensions.height} pixels. Try to not compress the image. Token image must be at least 24x24 pixels! Optimal size is 80x80 pixels. 🎯`);
                return;
            }
        }

        let finalImageUrl = '';
        let processedSuccessfully = false;

        try {
            console.log('Using resize service for image processing');
            
            // Déterminer les dimensions cibles
            let targetWidth, targetHeight;
            
            if (isToken) {
                targetWidth = 80;
                targetHeight = 80;
            } else if (isThumbnail) {
                targetWidth = 400;
                targetHeight = 400;
            } else {
                targetWidth = 200;
                targetHeight = 200;
            }
            
            // Redimensionner l'image
            const resizedImageBuffer = await resizeImageWithService(fileUrl, targetWidth, targetHeight, isThumbnail, !isThumbnail);
            
            // Sauvegarder l'image redimensionnée dans R2
            const cleanProjectName = (ctx.session.answers.projectName || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            let fileName;
            if (isToken) {
                fileName = `${cleanProjectName}_token_${targetWidth}x${targetHeight}.jpg`;
            } else if (isThumbnail) {
                fileName = `${cleanProjectName}_thumbnail_${targetWidth}x${targetHeight}.jpg`;
            } else {
                fileName = `${cleanProjectName}_logo_${targetWidth}x${targetHeight}.jpg`;
            }
            
            const filePath = `images/${cleanProjectName}/${fileName}`;
            
            await env.BUCKET.put(filePath, resizedImageBuffer, {
                httpMetadata: {
                    contentType: 'image/jpeg'
                }
            });
            
            finalImageUrl = `https://${env.BUCKET_URL}/${filePath}`;
            processedSuccessfully = true;
            
            // Stocker l'URL de l'image
            if (isToken) {
                ctx.session.answers.tokenPicture = finalImageUrl;
            } else if (isThumbnail) {
                ctx.session.answers.thumbnailPicture = finalImageUrl;
            } else {
                ctx.session.answers.projectPicture = finalImageUrl;
            }
            
            // Envoyer un message avec l'image redimensionnée
            await ctx.replyWithPhoto(finalImageUrl, {
                caption: `✅ ${isToken ? 'Token' : isThumbnail ? 'Thumbnail' : 'Logo'} image has been saved.`
            });
        } catch (resizeError) {
            console.error('Resize service error:', resizeError);
            
            // En dernier recours, utiliser l'image originale
            const imageBuffer = await response.arrayBuffer();
            
            // Sauvegarder l'image dans R2
            const cleanProjectName = (ctx.session.answers.projectName || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            let fileName;
            if (isToken) {
                fileName = `${cleanProjectName}_token_original.jpg`;
            } else if (isThumbnail) {
                fileName = `${cleanProjectName}_thumbnail_original.jpg`;
            } else {
                fileName = `${cleanProjectName}_logo_original.jpg`;
            }
            
            const filePath = `images/${cleanProjectName}/${fileName}`;
            
            await env.BUCKET.put(filePath, imageBuffer, {
                httpMetadata: {
                    contentType: 'image/jpeg'
                }
            });
            
            finalImageUrl = `https://${env.BUCKET_URL}/${filePath}`;
            console.log('Original image saved to R2:', finalImageUrl);
            
            // Stocker l'URL de l'image
            if (isToken) {
                ctx.session.answers.tokenPicture = finalImageUrl;
            } else if (isThumbnail) {
                ctx.session.answers.thumbnailPicture = finalImageUrl;
            } else {
                ctx.session.answers.projectPicture = finalImageUrl;
            }
            
            // Envoyer un message avec l'image originale
            await ctx.replyWithPhoto(finalImageUrl, {
                caption: `⚠️ Image saved but not resized (using original dimensions).\n\n${isToken ? 'Token' : isThumbnail ? 'Thumbnail' : 'Logo'} image has been saved.`
            });
        }

        // Informer l'utilisateur du résultat
        if (!processedSuccessfully) {
            await ctx.reply(`Note: The image could not be processed by our resizing services, so we've saved the original. It will work, but for optimal display, consider manually resizing your image to ${isToken ? '80x80' : isThumbnail ? '400x400' : '200x200'} pixels.`);
        }

        ctx.session.answers.currentQuestion++;
        await askNextQuestion(ctx, env);
    } catch (error) {
        console.error('Detailed error in handleImage:', error);
        if (error instanceof Error) {
            await ctx.reply(`Error processing image: ${error.message}`);
        } else {
            await ctx.reply("Error processing image. Please make sure you're sending a valid JPG or PNG file and try again.");
        }
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // Créer la table si elle n'existe pas
        await env.DB.prepare(CREATE_TABLE).run();

        // Gérer le callback Twitter
        if (request.url.includes('/twitter/callback')) {
            console.log('2.1-Received Twitter callback request:', request.url);
            const url = new URL(request.url);
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            
            console.log('2.2-Twitter callback parameters:', { 
                code: code ? 'present' : 'missing', 
                state: state ? 'present' : 'missing',
                error: error || 'none'
            });

            if (error) {
                console.error('2.3-Twitter callback error:', error);
                return Response.json({ error: `Twitter authentication error: ${error}` }, { status: 400 });
            }

            if (!code || !state) {
                console.error('2.4-Missing code or state in Twitter callback');
                return Response.json({ error: 'Missing parameters' }, { status: 400 });
            }

            // Récupérer le username depuis le token
            console.log('2.5-Exchanging code for access token');
            try {
                const response = await fetch('https://api.twitter.com/2/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${btoa(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`)}`
                    },
                    body: new URLSearchParams({
                        'grant_type': 'authorization_code',
                        'code': code,
                        'redirect_uri': env.TWITTER_CALLBACK_URL,
                        'code_verifier': 'challenge'
                    })
                });

                console.log('2.6-Token response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('2.7-Twitter token exchange failed:', response.status, errorText);
                    return new Response(`Error getting token: ${response.status} - ${errorText}`, { status: 500 });
                }

                const data = await response.json();
                
                console.log('2.8-Access Token received:', data.access_token ? 'present' : 'missing');
                console.log('2.9-Token type:', data.token_type);
                console.log('2.10-Expires in:', data.expires_in);
                
                // Récupérer les infos utilisateur
                console.log('2.11-Fetching user information');
                const userResponse = await fetch('https://api.twitter.com/2/users/me', {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`
                    }
                });

                console.log('2.12-User info response status:', userResponse.status);

                const responseBody = await userResponse.text(); // Get the response as text
                console.log('2.13-Response Body length:', responseBody.length); 
                console.log('2.14-Response Body preview:', responseBody.substring(0, 200)); // Log the first 200 chars

                if (responseBody.trim() === '') {
                    console.error('2.15-Received empty response from Twitter API');
                    return new Response('Error getting user info: Empty response', { status: 500 });
                }

                let userData;
                try {
                    userData = JSON.parse(responseBody);
                    console.log('2.16-User data parsed successfully:', JSON.stringify(userData, null, 2));
                } catch (parseError) {
                    console.error('2.17-Failed to parse user data JSON:', parseError);
                    return new Response(`Error parsing user data: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`, { status: 500 });
                }
                
                if (!userData.data || !userData.data.username) {
                    console.error('2.18-Username not found in response:', userData);
                    return new Response('Error: Username not found in Twitter response', { status: 500 });
                }
                
                const username = userData.data.username;
                console.log('2.19-Twitter username retrieved:', username);

                // Rediriger vers Telegram avec le username
                const botUsername = env.BOT_USERNAME;
                const startParam = `twitter_success_${username}`;
                const redirectUrl = `https://t.me/${botUsername}?start=${startParam}`;
                
                console.log('Redirecting to:', redirectUrl);
                
                return Response.redirect(redirectUrl, 302);
            } catch (error) {
                console.error('2.20-Error in Twitter callback processing:', error);
                return new Response(`Error processing Twitter callback: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
            }
        }

        const bot = new Bot<MyContext>(env.BOT_TOKEN);
        await bot.init();

        bot.command("getGroupId", async (ctx) => {
            const chatId = ctx.chat?.id;
            const chatType = ctx.chat?.type;
            const chatTitle = ctx.chat?.title;
            const messageThreadId = ctx.message?.message_thread_id;
            const fromChat = ctx.message?.chat;
            
            console.log('Chat details:', {
                id: chatId,
                type: chatType,
                title: chatTitle,
                messageThreadId: messageThreadId,
                fromChat: fromChat,
                fullMessage: ctx.message
            });
            
            try {
                // Essayer d'envoyer dans le chat d'origine
                await ctx.api.sendMessage(chatId, `
Debug Chat Info:
ID: ${chatId}
Type: ${chatType}
Title: ${chatTitle}
Thread ID: ${messageThreadId}
From Chat: ${JSON.stringify(fromChat, null, 2)}
                `);
            } catch (error) {
                console.error('Error sending message:', error);
                // Si échec, essayer d'envoyer dans le chat général
                await ctx.reply(`Error sending to original chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });

        bot.command("ping", async (ctx) => {
            await ctx.reply("Pong!");
        });

        // Middleware de debug et initialisation de session
        bot.use(async (ctx, next) => {
            try {
                // Lire d'abord la session existante
                if (ctx.from?.id) {
                    const storage = new CloudflareStorage(env.SESSION_STORE);
                    const existingSession = await storage.read(ctx.from.id.toString());
                    
                    if (existingSession) {
                        ctx.session = existingSession;
                        console.log('Loaded existing session:', existingSession);
                    } else {
                        // Initialiser une nouvelle session seulement si aucune n'existe
                        console.log('No existing session found, creating new one');
                        ctx.session = {
                            answers: {
                                currentQuestion: 0,
                                twitterConnected: false,
                                twitterUsername: '',
                                projectName: '',
                                description: '',
                                projectPicture: '',
                                thumbnailPicture: '',
                                websiteLink: '',
                                communityLink: '',
                                xLink: '',
                                chain: '',
                                sector: '',
                                vesting: '',
                                fdvMin: '',
                                fdvMax: '',
                                fdv: '',
                                ticker: '',
                                tokenPicture: '',
                                dataRoom: '',
                                strengths: ''
                            }
                        };
                        await storage.write(ctx.from.id.toString(), ctx.session);
                    }
                }

                await next();
                
                // Sauvegarder les modifications de session
                if (ctx.from?.id && ctx.session) {
                    const storage = new CloudflareStorage(env.SESSION_STORE);
                    await storage.write(ctx.from.id.toString(), ctx.session);
                }
            } catch (error) {
                console.error('Session middleware error:', error);
                throw error;
            }
        });

        // Configuration de la session (après le middleware)
        bot.use(session<SessionData, MyContext>({
            initial: () => ({
                answers: {
                    currentQuestion: 0,
                    twitterConnected: false,
                    twitterUsername: '',
                    projectName: '',
                    description: '',
                    projectPicture: '',
                    thumbnailPicture: '',
                    websiteLink: '',
                    communityLink: '',
                    xLink: '',
                    chain: '',
                    sector: '',
                    vesting: '',
                    fdvMin: '',
                    fdvMax: '',
                    fdv: '',
                    ticker: '',
                    tokenPicture: '',
                    dataRoom: '',
                    strengths: ''
                }
            }),
            storage: new CloudflareStorage(env.SESSION_STORE),
            getSessionKey: (ctx) => ctx.from?.id?.toString()
        }));

        // Commande /start
        bot.command("start", async (ctx) => {
            console.log('1-Start command received:', ctx.message?.text);
            console.log('1.1-Username:', ctx.from?.username);
            const userName = ctx.from?.first_name || "there";
            
            // Si c'est un callback Twitter
            if (ctx.message?.text?.includes('twitter_success_')) {
                console.log('1.2-Processing Twitter success');
                try {
                    const username = ctx.message.text.split('twitter_success_')[1];
                    
                    // Forcer l'initialisation de la session si nécessaire
                    if (!ctx.session) {
                        ctx.session = {
                            answers: {
                                currentQuestion: 0,
                                twitterConnected: false,
                                twitterUsername: '',
                                projectName: '',
                                description: '',
                                projectPicture: '',
                                thumbnailPicture: '',
                                websiteLink: '',
                                communityLink: '',
                                xLink: '',
                                chain: '',
                                sector: '',
                                vesting: '',
                                fdvMin: '',
                                fdvMax: '',
                                fdv: '',
                                ticker: '',
                                tokenPicture: '',
                                dataRoom: '',
                                strengths: ''
                            }
                        };
                    }

                    // Mettre à jour l'état de connexion Twitter
                    ctx.session.answers.twitterConnected = true;
                    ctx.session.answers.twitterUsername = username;

                    // Forcer la sauvegarde immédiate de la session
                    if (ctx.from?.id) {
                        const storage = new CloudflareStorage(env.SESSION_STORE);
                        await storage.write(ctx.from.id.toString(), ctx.session);
                    }

                    // Envoyer les images d'exemple en utilisant des URLs
                    await ctx.replyWithPhoto("https://pub-0cbbb3349b8a4e4384de7e35e44350eb.r2.dev/screenshots/screen1.png");
                    await ctx.replyWithPhoto("https://pub-0cbbb3349b8a4e4384de7e35e44350eb.r2.dev/screenshots/screen2.png");

                    await ctx.reply(`GM @${username}! 👋\n\nI'll guide you through creating your page in the Draft Pick section on BorgPad. You'll find attached photos showing where all the information will be displayed. Shall we begin?`);
                    await askNextQuestion(ctx, env);
                    console.log('1.3-Twitter success processed');
                } catch (error) {
                    console.error('1.4-Error in Twitter callback:', error);
                    await ctx.reply("An error occurred while connecting your Twitter account. Please try again.");
                }
                return;
            }

            // Générer le lien d'authentification Twitter
            try {
                const state = Math.random().toString(36).substring(7);
                const codeChallenge = 'challenge'; // PKCE requirement
                
                const params = new URLSearchParams({
                    'response_type': 'code',
                    'client_id': env.TWITTER_CLIENT_ID,
                    'redirect_uri': env.TWITTER_CALLBACK_URL,
                    'scope': 'users.read tweet.read offline.access',
                    'state': state,
                    'code_challenge': codeChallenge,
                    'code_challenge_method': 'plain'
                });

                const url = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
                console.log('1.5-Generated Twitter auth URL:', url);
                
                const keyboard = new InlineKeyboard()
                    .url("Connect with X 🐦", url)
                    .row();

                await ctx.reply(
                    `Welcome ${userName}! 👋\n\nI'm the BorgPad Curator Bot. First, please connect your X account:`,
                    { reply_markup: keyboard }
                );
                console.log('1.6-Twitter auth link sent');
            } catch (error) {
                console.error('1.7-Error generating Twitter auth link:', error);
                await ctx.reply("Sorry, there was an error setting up Twitter authentication. Please try again later.");
            }
        });

        // Gestionnaire de messages
        bot.on(["message:text", "message:photo"], async (ctx) => {
            console.log('Session state:', {
                exists: !!ctx.session,
                twitterConnected: ctx.session?.answers?.twitterConnected,
                username: ctx.session?.answers?.twitterUsername
            });

            // Vérifier si Twitter est connecté
            if (!ctx.session?.answers?.twitterConnected) {
                const keyboard = new InlineKeyboard()
                    .url("Connect with X 🐦", generateTwitterAuthUrl(env));
                    
                await ctx.reply("Please connect your X account first! 🐦", { reply_markup: keyboard });
                return;
            }

            console.log('Current question:', ctx.session.answers.currentQuestion);
            console.log('Received message:', ctx.message);

            if (ctx.session.answers.currentQuestion >= questions.length) return;

            const answers = ctx.session.answers;
            const currentQuestion = answers.currentQuestion;

            let shouldMoveToNextQuestion = true;

            // Vérifier si une image est attendue
            if (currentQuestion === 2 || currentQuestion === 3 || currentQuestion === 13) {
                if (!ctx.message.photo && !ctx.message.document) {
                    await ctx.reply("Please send an image (jpg or png format) 🖼️");
                    shouldMoveToNextQuestion = false;
                    return;
                }
            } else if (ctx.message.photo) {
                await ctx.reply("A text response is expected for this question. Please provide text. 📝");
                shouldMoveToNextQuestion = false;
                return;
            }

            // Gérer les réponses selon la question
            try {
                if (ctx.message.photo && (currentQuestion === 2 || currentQuestion === 3 || currentQuestion === 13)) {
                    const photo = ctx.message.photo[0]; // Utiliser la première version (non compressée)
                    const file = await ctx.api.getFile(photo.file_id);
                    
                    if (!file.file_path) {
                        await ctx.reply("Error: Couldn't get the file path. Please try sending the image as a file.");
                        shouldMoveToNextQuestion = false;
                        return;
                    }

                    const fileUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path}`;
                    
                    // Sauvegarder l'image dans R2
                    await handleImage(ctx, env, fileUrl, currentQuestion === 13, currentQuestion === 3);
                    return; // Ajout de ce return pour éviter le double traitement
                    
                } else if (ctx.message.text) {
                    switch (currentQuestion) {
                        case 0: answers.projectName = ctx.message.text; break;
                        case 1: 
                            if (ctx.message.text.length > 80) {
                                await ctx.reply("Description too long! Please limit your description to 80 characters (spaces included). Current length: " + ctx.message.text.length);
                                shouldMoveToNextQuestion = false;
                                return;
                            }
                            answers.description = ctx.message.text;
                            break;
                        case 2: answers.projectPicture = ctx.message.text; break;
                        case 3: answers.thumbnailPicture = ctx.message.text; break;
                        case 4: answers.websiteLink = ctx.message.text; break;
                        case 5: answers.communityLink = ctx.message.text; break;
                        case 6: answers.xLink = ctx.message.text; break;
                        case 7: answers.chain = ctx.message.text; break;
                        case 8: answers.sector = ctx.message.text; break;
                        case 9: answers.vesting = ctx.message.text; break;
                        case 10: answers.fdvMin = ctx.message.text; break;
                        case 11: answers.fdvMax = ctx.message.text; break;
                        case 12: 
                        if (!ctx.message.text.startsWith('$') || ctx.message.text.length > 6) {
                            await ctx.reply("Invalid ticker format. Must start with '$' and be up to 5 characters long in uppercase. 💔");
                            shouldMoveToNextQuestion = false;
                            return;
                        }
                        answers.ticker = ctx.message.text;
                        break;
                        case 14:
                            answers.dataRoom = ctx.message.text;
                            console.log('Saving dataRoom:', ctx.message.text);
                            
                            // Force la sauvegarde dans le KV
                            if (ctx.from?.id) {
                                const storage = new CloudflareStorage(env.SESSION_STORE);
                                await storage.write(ctx.from.id.toString(), ctx.session);
                                console.log('Session saved with dataRoom:', ctx.session);
                            }
                            break;
                        case 15:
                            answers.strengths = ctx.message.text;
                            console.log('Saving strengths:', ctx.message.text);
                            
                            // Force la sauvegarde dans le KV
                            if (ctx.from?.id) {
                                const storage = new CloudflareStorage(env.SESSION_STORE);
                                await storage.write(ctx.from.id.toString(), ctx.session);
                                console.log('Session saved with strengths:', ctx.session);
                            }
                            break;
                    }
                }

                // Passer à la question suivante seulement si tout s'est bien passé
                if (shouldMoveToNextQuestion) {
                    answers.currentQuestion++;
                    console.log('Moving to question:', answers.currentQuestion);
                    await askNextQuestion(ctx, env);
                }
            } catch (error) {
                console.error('Error processing message:', error);
                await ctx.reply("An error occurred. Please try again.");
            }
        });

        // Gestionnaire pour les photos (compressées)
        bot.on("message:photo", async (ctx) => {
            const currentQuestion = ctx.session.answers.currentQuestion;
            
            if (currentQuestion === 2 || currentQuestion === 3 || currentQuestion === 13) {
                const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Meilleure qualité disponible
                const file = await ctx.api.getFile(photo.file_id);
                
                if (!file.file_path) {
                    await ctx.reply("Error: Couldn't get the file path. Please try again.");
                    return;
                }

                const fileUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path}`;
                await handleImage(ctx, env, fileUrl, currentQuestion === 13, currentQuestion === 3);
            }
        });

        // Gestionnaire pour les documents (non compressés)
        bot.on("message:document", async (ctx) => {
            const currentQuestion = ctx.session.answers.currentQuestion;
            
            if (currentQuestion === 2 || currentQuestion === 3 || currentQuestion === 13) {
                const doc = ctx.message.document;
                
                if (!doc.mime_type?.startsWith('image/')) {
                    await ctx.reply("Please send a valid image file (jpg or png).");
                    return;
                }

                const file = await ctx.api.getFile(doc.file_id);
                if (!file.file_path) {
                    await ctx.reply("Error: Couldn't get the file path. Please try again.");
                    return;
                }

                const fileUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path}`;
                await handleImage(ctx, env, fileUrl, currentQuestion === 13, currentQuestion === 3);
            }
        });

        // Fonction utilitaire pour générer l'URL Twitter
        function generateTwitterAuthUrl(env: Env): string {
            const state = Math.random().toString(36).substring(7);
            const params = new URLSearchParams({
                'response_type': 'code',
                'client_id': env.TWITTER_CLIENT_ID,
                'redirect_uri': env.TWITTER_CALLBACK_URL,
                'scope': 'users.read tweet.read offline.access',
                'state': state,
                'code_challenge': 'challenge',
                'code_challenge_method': 'plain'
            });

            return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
        }

        // Ajouter le gestionnaire de boutons
        bot.on("callback_query:data", async (ctx) => {
            const data = ctx.callbackQuery.data;
            const answers = ctx.session.answers;
            
            console.log('Callback data:', data);
            
            if (data?.startsWith("chain_")) {
                answers.chain = data.replace("chain_", "");
                await ctx.reply(`Chain selected: ${answers.chain} ✅`);
                
                // Passer à la question suivante
                answers.currentQuestion++;
                await askNextQuestion(ctx, env);
            }
            else if (data?.startsWith("vesting_")) {
                const vestingType = data.replace("vesting_", "");
                
                // Définir le texte descriptif en fonction du type de vesting
                let vestingDescription = "";
                if (vestingType === "6month") {
                    vestingDescription = "6 month vesting";
                } else if (vestingType === "3month") {
                    vestingDescription = "3 month vesting";
                } else if (vestingType === "50tge") {
                    vestingDescription = "50% TGE then 25% per month";
                }
                
                answers.vesting = vestingDescription;
                await ctx.reply(`Vesting set to: ${vestingDescription} ✅`);
                
                // Passer à la question suivante
                answers.currentQuestion++;
                await askNextQuestion(ctx, env);
            }
            else if (data?.startsWith("fdvMin_")) {
                const minValue = data.replace("fdvMin_", "");
                answers.fdvMin = minValue;
                await ctx.reply(`FDV Min set to: $${minValue}M ✅`);
                
                // Passer à la question suivante
                answers.currentQuestion++;
                await askNextQuestion(ctx, env);
            }
            else if (data?.startsWith("fdvMax_")) {
                const maxValue = data.replace("fdvMax_", "");
                answers.fdvMax = maxValue;
                
                // Mettre à jour le champ fdv avec la fourchette complète
                const min = answers.fdvMin || "1";
                answers.fdv = `$${min}M - $${maxValue}M`;
                
                await ctx.reply(`FDV Max set to: $${maxValue}M ✅\nFDV Range: ${answers.fdv}`);
                
                // Passer à la question suivante
                answers.currentQuestion++;
                await askNextQuestion(ctx, env);
            }

            // Confirmer la sélection
            await ctx.answerCallbackQuery();
        });

        try {
            await webhookCallback(bot, "cloudflare")({
                request,
                respondWith: (r) => r
            });
            return new Response("OK", { status: 200 });
        } catch (error) {
            console.error('Error in webhook handler:', error);
            return new Response('Error processing webhook', { status: 500 });
        }
    },
};
