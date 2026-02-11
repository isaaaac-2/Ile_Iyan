import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendBotMessage, fetchTTSAudio, getBotGreeting } from "../services/api";
import { useCart } from "../context/CartContext";

export default function VoiceBot({ menu, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [botState, setBotState] = useState("greeting");
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingSoups, setPendingSoups] = useState([]);
  const [pendingProteins, setPendingProteins] = useState([]);
  const [pendingPortion, setPendingPortion] = useState("small");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { dispatch } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const speakText = useCallback(
    async (text) => {
      if (!ttsEnabled) return;
      try {
        const audioUrl = await fetchTTSAudio(text);
        const audio = new Audio(audioUrl);
        audio.play();
      } catch {
        // TTS not available, use browser speech synthesis as fallback
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      }
    },
    [ttsEnabled]
  );

  const addBotMessage = useCallback(
    (text) => {
      setMessages((prev) => [...prev, { role: "bot", text, time: new Date() }]);
      speakText(text);
    },
    [speakText]
  );

  useEffect(() => {
    let cancelled = false;
    // Initial greeting
    getBotGreeting()
      .then((data) => {
        if (!cancelled) addBotMessage(data.message);
      })
      .catch(() => {
        if (!cancelled)
          addBotMessage(
            "Welcome to Ilé Ìyán! I'm your voice ordering assistant. What would you like to order today?"
          );
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg, time: new Date() },
    ]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await sendBotMessage(userMsg, [], botState);
      setBotState(response.state);

      // Handle actions
      if (response.action) {
        switch (response.action.type) {
          case "select_soups":
            setPendingSoups(response.action.soups);
            break;
          case "select_proteins":
            setPendingProteins(response.action.proteins || []);
            break;
          case "select_portion":
            setPendingPortion(response.action.portion);
            break;
          case "add_to_cart":
          case "place_order":
            if (pendingSoups.length > 0 || response.action.type === "place_order") {
              const item = {
                soups: pendingSoups,
                proteins: pendingProteins,
                portion: pendingPortion,
                quantity: 1,
              };
              if (pendingSoups.length > 0) {
                dispatch({ type: "ADD_ITEM", payload: item });
              }
              if (response.action.type === "place_order") {
                onNavigate("order");
              }
              setPendingSoups([]);
              setPendingProteins([]);
              setPendingPortion("small");
            }
            break;
          default:
            break;
        }
      }

      addBotMessage(response.message);
    } catch {
      addBotMessage("Sorry, I had trouble processing that. Could you try again?");
    }
    setIsProcessing(false);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      addBotMessage(
        "Speech recognition is not supported in your browser. Please type your order instead."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="voice-bot">
      <div className="bot-header">
        <div className="bot-header-left">
          <span className="bot-avatar">🤖</span>
          <div>
            <h2>Ilé Ìyán Assistant</h2>
            <span className="bot-status">
              {isProcessing ? "Thinking..." : "Online"}
            </span>
          </div>
        </div>
        <label className="tts-toggle">
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={(e) => setTtsEnabled(e.target.checked)}
          />
          <span>🔊 TTS {ttsEnabled ? "On" : "Off"}</span>
        </label>
      </div>

      <div className="bot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`bot-message ${msg.role}`}>
            <div className="message-bubble">
              {msg.role === "bot" && <span className="msg-avatar">🤖</span>}
              <div className="msg-content">
                <p>{msg.text}</p>
                <span className="msg-time">
                  {msg.time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {msg.role === "user" && <span className="msg-avatar">👤</span>}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="bot-message bot">
            <div className="message-bubble">
              <span className="msg-avatar">🤖</span>
              <div className="msg-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bot-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Type your order or use the mic..."
          disabled={isProcessing}
        />
        <button
          className={`mic-btn ${isListening ? "listening" : ""}`}
          onClick={isListening ? stopListening : startListening}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          title={isListening ? "Stop listening" : "Tap to speak"}
        >
          {isListening ? "⏹️" : "🎤"}
        </button>
        <button
          className="send-btn"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isProcessing}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
