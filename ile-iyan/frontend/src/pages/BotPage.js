import React, { useState, useEffect } from "react";
import VoiceBot from "../components/VoiceBot";
import { fetchMenu } from "../services/api";

export default function BotPage({ onNavigate }) {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    fetchMenu().then(setMenu).catch(() => {});
  }, []);

  return (
    <div className="bot-page">
      <div className="bot-page-header">
        <h1>🎙️ Voice Ordering</h1>
        <p>
          Talk to our AI assistant to place your order hands-free. Toggle TTS
          on/off as you prefer.
        </p>
      </div>
      <VoiceBot menu={menu} onNavigate={onNavigate} />
    </div>
  );
}
