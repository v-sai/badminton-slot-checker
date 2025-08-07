const axios = require("axios");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const VENUE_ID = process.env.VENUE_ID || "1";
const DATE = process.env.BOOKING_DATE; // Dynamic date

async function fetchSlotData() {
  try {
    const url = `https://adminbooking.gopichandacademy.com/API/Get/Calender?venue_id=${VENUE_ID}&date=${DATE}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch slot data", error.message);
    return null;
  }
}

async function sendTelegramMessage(message) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
    console.log("✅ Telegram message sent!");
  } catch (error) {
    console.error("❌ Failed to send Telegram message", error.message);
  }
}

async function main() {
  if (!DATE) {
    console.error("❌ BOOKING_DATE is required as an environment variable.");
    return;
  }

  const data = await fetchSlotData();
  if (!data || !data.Result) {
    console.log("No booking data available.");
    return;
  }

  const anyAvailable = Object.values(data.Result).some((court) => {
    return (court.court_available_slots || []).some((slot) => {
      const [_, isAvailable] = slot.split("|");
      return isAvailable === "1";
    });
  });

  if (anyAvailable) {
    await sendTelegramMessage(`🏸 Slots are available on ${DATE} at venue ${VENUE_ID}!`);
  } else {
    console.log("No available slots found.");
  }
}

main();
