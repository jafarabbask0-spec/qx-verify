const { Telegraf, Markup } = require('telegraf');

// ==================== CONFIGURATION ====================
const BOT_TOKEN = '8841729872:AAH9XckuguVpZkOONHmI9lR-mAwtBHo1Tv4';
const AFFILIATE_LINK = 'https://broker-qx.pro/sign-up/?lid=1401543';
const VIP_CHANNEL_LINK = 'https://t.me/+23C9bDAfba9mOGY0';
const OWNER_USERNAME = '@QUOTEX_PRO_SIGNALS_786';
const BOT_USERNAME = '@q_p_s_bot';
const VERCEL_APP_URL = 'https://qx-verify.vercel.app/';
const FIREBASE_DB_URL = 'https://qx-verify-default-rtdb.firebaseio.com/users.json';
// =======================================================

const bot = new Telegraf(BOT_TOKEN);

// Function to fetch data from Firebase Realtime Database
async function checkTraderIdInFirebase(traderId) {
    try {
        const response = await fetch(FIREBASE_DB_URL);
        if (!response.ok) return false;
        
        const usersData = await response.json();
        if (!usersData) return false;

        // Loop through Firebase data to match traderId and verify status
        for (const key in usersData) {
            if (usersData[key] && String(usersData[key].traderId) === String(traderId)) {
                // If your database uses a "verified" status flag, check it here
                return true; 
            }
        }
        return false;
    } catch (error) {
        console.error("Firebase fetch error:", error);
        return false;
    }
}

// Function to save/update user in Firebase after successful verification
async function saveUserToFirebase(telegramUid, traderId) {
    try {
        const userUrl = `https://qx-verify-default-rtdb.firebaseio.com/users/${telegramUid}.json`;
        await fetch(userUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                traderId: traderId,
                verified: true,
                updatedAt: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error("Firebase save error:", error);
    }
}

// START COMMAND
bot.start((ctx) => {
    const firstName = ctx.from.first_name ? ctx.from.first_name.toUpperCase() : 'TRADER';
    const welcomeText = `👋 WELCOME ${firstName} TO TALHA TRADER QUOTEX VERIFICATION BOT!\n\n` +
                        `AGAR AAP HAMARE VIP CHANNEL MEIN JOIN HONA CHAHTE HAIN, TO NEECHE DIYE GAYE STEPS FOLLOW KAREN:\n\n` +
                        `1️⃣ NEECHE DIYE GAYE LINK PAR CLICK KARKE NEW ACCOUNT BANAYEN.\n` +
                        `2️⃣ APNE ACCOUNT MEIN DEPOSIT KAREN.\n` +
                        `3️⃣ APNI QUOTEX TRADER ID SUBMIT KAREN.`;

    ctx.reply(welcomeText, Markup.inlineKeyboard([
        [Markup.button.url('📊 CREATE QUOTEX ACCOUNT', AFFILIATE_LINK)],
        [Markup.button.callback('🔍 VERIFY TRADER ID', 'VERIFY_ID')],
        [Markup.button.url('🌐 VISIT VERIFICATION PORTAL', VERCEL_APP_URL)],
        [Markup.button.url('👨‍💻 CONTACT OWNER', `https://t.me/${OWNER_USERNAME.replace('@', '')}`)]
    ]));
});

// ACTION: VERIFY BUTTON CLICK
bot.action('VERIFY_ID', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('📝 KRIPYA APNI 8-SE-10 DIGIT KI QUOTEX TRADER ID SEND KAREN:\n\n(EXAMPLE: 12345678)');
});

// HANDLING TEXT MESSAGE (TRADER ID SUBMISSION)
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    const telegramUid = ctx.from.id.toString();

    // Regular Expression to check if input is a digit between 6 to 12 length
    if (/^\d{6,12}$/.test(text)) {
        const traderId = text;
        await ctx.reply('⏳ PLEASE WAIT... AAPKI ID FIREBASE DATABASE MEIN VERIFY KI JA RAHI HAI...');

        const isApproved = await checkTraderIdInFirebase(traderId);

        if (isApproved) {
            // Save data to Firebase for sync
            await saveUserToFirebase(telegramUid, traderId);

            ctx.reply(
                `✅ CONGRATULATIONS! AAPKI TRADER ID (${traderId}) SUCCESSFULLY VERIFY HO GAYI HAI.\n\n` +
                `👉 NEECHE DIYE GAYE BUTTON PAR CLICK KARKE VIP CHANNEL JOIN KAREN:`,
                Markup.inlineKeyboard([
                    [Markup.button.url('🚀 JOIN VIP CHANNEL NOW', VIP_CHANNEL_LINK)]
                ])
            );
        } else {
            ctx.reply(
                `❌ SORRY! AAPKI TRADER ID (${traderId}) DATABASE MEIN NAHI MILI YA APPROVED NAHI HAI.\n\n` +
                `AGAR AAPNE ACCOUNT NAHI BANAYA YA PORTAL PAR REGISTER NAHI KIYA, TO NEECHE DIYE GAYE LINKS KA USE KAREN.`,
                Markup.inlineKeyboard([
                    [Markup.button.url('📊 CREATE ACCOUNT', AFFILIATE_LINK)],
                    [Markup.button.url('🌐 PORTAL LINK', VERCEL_APP_URL)],
                    [Markup.button.callback('🔄 TRY AGAIN', 'VERIFY_ID')]
                ])
            );
        }
    } else {
        ctx.reply('⚠️ INVALID TRADER ID FORMAT! KRIPYA SIRF NUMBERS SEND KAREN (E.G., 12345678).');
    }
});

// CATCH ALL ERRORS
bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx.updateType}`, err);
});

// LAUNCH BOT
bot.launch().then(() => {
    console.log('🚀 QUOTEX FIREBASE BOT IS ONLINE AND RUNNING!');
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
