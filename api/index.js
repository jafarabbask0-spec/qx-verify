const { Telegraf } = require('telegraf');

const bot = new Telegraf('8841729872:AAH9XckuguVpZkOONHmI9lR-mAwtBHo1Tv4');

// Start Command
bot.start((ctx) => {
    const firstName = ctx.from.first_name || "User";
    const message = `👋*Hy Dear ${firstName}*\n\n*Please enter your Quotex Account ID (only numbers), after successful verification we will add you to the VIP group*`;
    
    return ctx.replyWithMarkdown(message);
});

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(200).send('Bot is running...');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error in bot');
    }
};
