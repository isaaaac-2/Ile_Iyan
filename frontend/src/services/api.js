// In production: REACT_APP_API_URL will be empty, so we use relative paths
// In development: defaults to localhost:5000
const API_BASE =
  process.env.REACT_APP_API_URL === undefined
    ? "http://localhost:5000"
    : process.env.REACT_APP_API_URL;

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/api/menu`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create order");
  }
  return res.json();
}

export async function getOrder(orderId) {
  const res = await fetch(`${API_BASE}/api/order/${orderId}`);
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}

export async function getBotGreeting() {
  const res = await fetch(`${API_BASE}/api/bot/greeting`);
  if (!res.ok) throw new Error("Failed to get greeting");
  return res.json();
}

export async function sendBotMessage(message, cart, state) {
  const res = await fetch(`${API_BASE}/api/bot/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, cart, state }),
  });
  if (!res.ok) throw new Error("Failed to process message");
  return res.json();
}

export function getTTSAudioUrl(text) {
  return `${API_BASE}/api/tts`;
}

export async function fetchTTSAudio(text) {
  const res = await fetch(`${API_BASE}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("TTS failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
