const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const csv = require('csv-parser');

// ==================== CONFIGURATION ====================
const BOT_TOKEN = '8841729872:AAH9XckuguVpZkOONHmI9lR-mAwtBHo1Tv4';
const AFFILIATE_LINK = 'https://broker-qx.pro/sign-up/?lid=1401543';
const VIP_CHANNEL_LINK = 'https://t.me/+23C9bDAfba9mOGY0';
const OWNER_USERNAME = '@QUOTEX_PRO_SIGNALS_786';
const BOT_USERNAME = '@q_p_s_bot';
// =======================================================

const bot = new Telegraf(BOT_TOKEN);
const DB_FILE = './users.json';
const CSV_FILE = './affiliates.csv';

// Local Database Initialize
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

// Function to read Database
function readDB() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Function to write Database
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Function to verify Trader ID from CSV
function checkTraderIdInCSV(traderId) {
    return new Promise((resolve) => {
        const ids = [];
        if (!fs.existsSync(CSV_FILE)) {
            resolve(false);
            return;
        }
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                if (row.trader_id) {
                    ids.push(row.trader_id.trim());
                }
            })
            .on('end', () => {
                resolve(ids.includes(traderId.trim()));
            })
            .on('error', () => {
                resolve(false);
            });
    });
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
    const userId = ctx.from.id.toString();

    // Check if input is a number and valid length for Trader ID
    if (/^\d{6,12}$/.test(text)) {
        const traderId = text;
        await ctx.reply('⏳ PLEASE WAIT... AAPKI ID VERIFY KI JA RAHI HAI...');

        const isApproved = await checkTraderIdInCSV(traderId);

        if (isApproved) {
            // Save to local JSON db
            const db = readDB();
            db[userId] = { traderId: traderId, verified: true, date: new Date().toISOString() };
            writeDB(db);

            ctx.reply(
                `✅ CONGRATULATIONS! AAPKI TRADER ID (${traderId}) SUCCESSFULLY VERIFY HO GAYI HAI.\n\n` +
                `👉 NEECHE DIYE GAYE BUTTON PAR CLICK KARKE VIP CHANNEL JOIN KAREN:`,
                Markup.inlineKeyboard([
                    [Markup.button.url('🚀 JOIN VIP CHANNEL NOW', VIP_CHANNEL_LINK)]
                ])
            );
        } else {
            ctx.reply(
                `❌ SORRY! AAPKI TRADER ID (${traderId}) HAMARE AFFILIATE LINK KE UNDER NAHI HAI.\n\n` +
                `AGAR AAPNE ABHI TAK ACCOUNT NAHI BANAYA, TO NEECHE DIYE GAYE LINK SE NEW ACCOUNT BANAYEN AUR PHIR ID SUBMIT KAREN.`,
                Markup.inlineKeyboard([
                    [Markup.button.url('📊 CREATE ACCOUNT', AFFILIATE_LINK)],
                    [Markup.button.callback('🔄 TRY AGAIN', 'VERIFY_ID')]
                ])
            );
        }
    } else {
        // Normal text handle if it's not a valid ID format
        ctx.reply('⚠️ INVALID TRADER ID FORMAT! KRIPYA SIRF NUMBERS SEND KAREN (E.G., 12345678).');
    }
});

// CATCH ERRORS TO PREVENT CRASH
bot.catch((err, ctx) => {
    console.error(`Bot encountered an error for ${ctx.updateType}`, err);
});

// LAUNCH BOT
bot.launch().then(() => {
    console.log('🚀 QUOTEX VERIFICATION BOT IS ONLINE AND RUNNING!');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
