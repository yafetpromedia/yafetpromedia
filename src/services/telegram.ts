export async function sendToTelegram(message: string) {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram token or chat ID is missing");
    return;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
