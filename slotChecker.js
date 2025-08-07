// slotChecker.js
const axios = require("axios");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const VENUE_ID = "1"; // Update if needed
const DATE = "2025-08-10"; // Change to next Sunday or make dynamic
const CHECK_SLOTS = ["08:00-09:00", "09:00-10:00"]; // You can update this

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
  const data = await fetchSlotData();
  if (!data || !data.Result) {
    console.log("No booking data available.");
    return;
  }

  const foundSlot = Object.values(data.Result).some((court) => {
    return (court.court_available_slots || []).some((slot) => {
      const [time, isAvailable] = slot.split("|");
      return CHECK_SLOTS.includes(time) && isAvailable === "1";
    });
  });

  if (foundSlot) {
    await sendTelegramMessage(`🏸 Slot available on ${DATE} at venue ${VENUE_ID}!`);
  } else {
    console.log("No matching slots available.");
  }
}

main();
