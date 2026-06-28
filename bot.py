import telebot
from telebot import types

# --- AAPKI DETAILS ---
API_TOKEN = "8841729872:AAH9XckuguVpZkOONHmI9lR-mAwtBHo1Tv4"
AFFILIATE_LINK = "https://broker-qx.pro/sign-up/?lid=1401543"
VIP_CHANNEL_LINK = "https://t.me/+23C9bDAfba9mOGY0"
OWNER_USERNAME = "@QUOTEX_PRO_SIGNALS_786"

bot = telebot.TeleBot(API_TOKEN)

# Dummy Database: Yahan aap un users ki IDs daal sakte hain jo verified hain.
# (Aap isse text file ya database se bhi connect kar sakte hain)
VERIFIED_TRADER_IDS = ["12345678", "87654321", "55555555"] 

@bot.message_handler(commands=['start'])
def send_welcome(message):
    welcome_text = (
        f"👋 **Welcome to QUOTEX PRO SIGNALS Verification Bot!**\n\n"
        f"VIP Channel join karne ke liye neeche diye gaye steps follow karein:\n\n"
        f"1️⃣ Sabse pehle hamare link se new account banayein:\n🔗 [Click Here to Register]({AFFILIATE_LINK})\n\n"
        f"2️⃣ Account banane ke baad apni **Quotex Trader ID (UID)** mujhe send karein."
    )
    
    markup = types.InlineKeyboardMarkup()
    btn1 = types.InlineKeyboardButton("🔗 Create Account", url=AFFILIATE_LINK)
    btn2 = types.InlineKeyboardButton("📩 Contact Owner", url=f"https://t.me/{OWNER_USERNAME.replace('@','')}")
    markup.add(btn1, btn2)
    
    bot.send_message(message.chat.id, welcome_text, parse_mode="Markdown", reply_markup=markup)

@bot.message_handler(func=lambda message: True)
def check_trader_id(message):
    user_input = message.text.strip()
    
    # Check agar input sirf numbers hai (Trader ID aam taur par digits hoti hai)
    if user_input.isdigit():
        bot.send_message(message.chat.id, "🔄 *Checking your Trader ID in our database... Please wait.*", parse_mode="Markdown")
        
        # Checking logic
        if user_input in VERIFIED_TRADER_IDS:
            success_text = (
                f"✅ **Congratulation! Your Trader ID ({user_input}) is Verified!**\n\n"
                f"Aap hamare affiliate member hain. Neeche diye gaye button par click karke VIP join karein 👇"
            )
            markup = types.InlineKeyboardMarkup()
            vip_btn = types.InlineKeyboardButton("🌟 Join VIP Channel", url=VIP_CHANNEL_LINK)
            markup.add(vip_btn)
            bot.send_message(message.chat.id, success_text, parse_mode="Markdown", reply_markup=markup)
        else:
            fail_text = (
                f"❌ **Verification Failed!**\n\n"
                f"Trader ID: `{user_input}` hamare link ke under nahi mili.\n\n"
                f"📌 **Sahi Tarika:**\n"
                f"1. Pehle purana account delete karein ya naye browser me naya account banayein.\n"
                f"2. Sirf is link se register karein: [Quotex Registration]({AFFILIATE_LINK})\n"
                f"3. Deposit karne ke baad apni ID dobara yahan send karein.\n\n"
                f"Agar koi masla ho to admin se baat karein: {OWNER_USERNAME}"
            )
            bot.send_message(message.chat.id, fail_text, parse_mode="Markdown", disable_web_page_preview=True)
    else:
        bot.send_message(message.chat.id, "⚠️ Please send a valid Quotex Trader ID (Numbers only).")

# Bot ko chalane ke liye
if __name__ == "__main__":
    print("Bot is running...")
    bot.infinity_polling()
