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
  const [pendingProteinQuantities, setPendingProteinQuantities] = useState({});
  const [pendingIyanQuantity, setPendingIyanQuantity] = useState("2");
  const [lastSpokenText, setLastSpokenText] = useState("");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const { dispatch } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const speakText = useCallback(
    (text) => {
      if (!ttsEnabled) return;

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Fetch and play TTS in the background without blocking
      fetchTTSAudio(text)
        .then((audioUrl) => {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.play().catch(() => {
            // Fallback to speech synthesis if audio play fails
            if ("speechSynthesis" in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = 1.0;
              utterance.pitch = 1.2;
              utterance.volume = 1.0;
              window.speechSynthesis.speak(utterance);
            }
          });
        })
        .catch(() => {
          // TTS not available, use browser speech synthesis as fallback
          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.2;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        });
    },
    [ttsEnabled],
  );

  const addBotMessage = useCallback(
    (text) => {
      // Prevent duplicate TTS calls for the same text
      if (lastSpokenText === text) return;

      setMessages((prev) => [...prev, { role: "bot", text, time: new Date() }]);
      setLastSpokenText(text);
      speakText(text);
    },
    [speakText, lastSpokenText],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    let cancelled = false;
    // Initial greeting - only show once on component mount
    const greetingTimeout = setTimeout(() => {
      getBotGreeting()
        .then((data) => {
          if (!cancelled && lastSpokenText !== data.message) {
            addBotMessage(data.message);
          }
        })
        .catch(() => {
          if (!cancelled) {
            const fallbackGreeting =
              "Welcome to Ilé Ìyán! I'm your voice ordering assistant. What would you like to order today?";
            if (lastSpokenText !== fallbackGreeting) {
              addBotMessage(fallbackGreeting);
            }
          }
        });
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(greetingTimeout);
    };
  }, []);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Stop any currently playing TTS
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const userMsg = text.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg, time: new Date() },
    ]);
    setInput(""); // Clear input immediately
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
          case "select_iyan_quantity":
            setPendingIyanQuantity(response.action.iyan_quantity);
            break;
          case "select_protein_quantity":
            if (response.action.protein_id && response.action.protein_quantity) {
              setPendingProteinQuantities((prev) => ({
                ...prev,
                [response.action.protein_id]: response.action.protein_quantity,
              }));
            }
            break;
          case "add_to_cart":
          case "place_order":
            if (
              pendingSoups.length > 0 ||
              response.action.type === "place_order"
            ) {
              const item = {
                soups: pendingSoups,
                proteins: pendingProteins,
                iyan_quantity: pendingIyanQuantity,
                protein_quantities: pendingProteinQuantities,
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
              setPendingProteinQuantities({});
              setPendingIyanQuantity("2");
            }
            break;
          default:
            break;
        }
      }

      addBotMessage(response.message);
    } catch {
      addBotMessage(
        "Sorry, I had trouble processing that. Could you try again?",
      );
    }
    setIsProcessing(false);
  };

  const startListening = () => {
    // Stop any currently playing TTS before listening
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      addBotMessage(
        "Speech recognition is not supported in your browser. Please type your order instead.",
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true; // Show partial results as user speaks
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      // Collect interim and final results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Update input with interim or final result
      const displayText = finalTranscript.trim() || interimTranscript.trim();
      setInput(displayText);

      // When speech recognition ends and we have a final transcript, send it
      if (finalTranscript.trim() && event.results[event.results.length - 1].isFinal) {
        // Small delay to allow UI update
        setTimeout(() => {
          handleSend(finalTranscript.trim());
        }, 100);
      }
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
