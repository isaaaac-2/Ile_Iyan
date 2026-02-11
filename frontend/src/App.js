import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [currentState, setCurrentState] = useState('welcome'); // welcome, askingName, askingQuantity, confirming
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Text-to-Speech function
  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      synthRef.current.speak(utterance);
    });
  }, []);

  // Reset order state
  const resetOrder = useCallback(() => {
    setCurrentState('welcome');
    setCustomerName('');
    setQuantity(1);
    setTranscript('');
  }, []);

  // Place order via API
  const placeOrder = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          quantity: quantity
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderStatus(data.message);
        await speak(data.message);
        setTimeout(() => {
          resetOrder();
          const welcomeMsg = 'Thank you! Say "start order" to place another order.';
          setOrderStatus(welcomeMsg);
          speak(welcomeMsg);
        }, 3000);
      } else {
        setOrderStatus('Error placing order. Please try again.');
        await speak('Error placing order. Please try again.');
        resetOrder();
      }
    } catch (error) {
      console.error('Order error:', error);
      setOrderStatus('Cannot connect to server. Please make sure the backend is running.');
      await speak('Cannot connect to server. Please try again later.');
      resetOrder();
    }
  }, [customerName, quantity, speak, resetOrder]);

  // Handle voice commands based on current state
  const handleVoiceCommand = useCallback(async (command) => {
    console.log('Command:', command, 'State:', currentState);

    if (currentState === 'welcome') {
      // Check if user wants to order
      if (command.includes('order') || command.includes('start') || command.includes('yes') || command.includes('iyan')) {
        setCurrentState('askingName');
        setOrderStatus('Great! What is your name?');
        await speak('Great! What is your name?');
      }
    } else if (currentState === 'askingName') {
      // Extract name from command
      let name = command.replace(/my name is/gi, '').replace(/i am/gi, '').replace(/i'm/gi, '').trim();
      if (name.length > 0) {
        setCustomerName(name);
        setCurrentState('askingQuantity');
        const message = `Nice to meet you ${name}! How many plates of Iyan would you like?`;
        setOrderStatus(message);
        await speak(message);
      }
    } else if (currentState === 'askingQuantity') {
      // Extract quantity from command
      const numbers = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      
      let qty = 1;
      
      // Check for number words
      for (const [word, num] of Object.entries(numbers)) {
        if (command.includes(word)) {
          qty = num;
          break;
        }
      }
      
      // Check for digits
      const digitMatch = command.match(/\d+/);
      if (digitMatch) {
        qty = parseInt(digitMatch[0]);
      }
      
      setQuantity(qty);
      setCurrentState('confirming');
      const message = `You want ${qty} plate${qty > 1 ? 's' : ''} of Iyan. Say "confirm" to place your order or "cancel" to start over.`;
      setOrderStatus(message);
      await speak(message);
    } else if (currentState === 'confirming') {
      if (command.includes('confirm') || command.includes('yes') || command.includes('correct')) {
        await placeOrder();
      } else if (command.includes('cancel') || command.includes('no') || command.includes('restart')) {
        resetOrder();
        const message = 'Order cancelled. Say "start order" to begin again.';
        setOrderStatus(message);
        await speak(message);
      }
    }
  }, [currentState, speak, placeOrder, resetOrder]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setOrderStatus('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if not in welcome state
      if (currentState !== 'welcome') {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('Recognition restart error:', e);
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setOrderStatus(`Error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript.toLowerCase().trim();
      setTranscript(transcriptResult);
      handleVoiceCommand(transcriptResult);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentState, handleVoiceCommand]);

  // Start voice interaction
  const startVoiceInteraction = useCallback(async () => {
    const welcomeMessage = 'Welcome to Ile Iyan! We serve delicious Pounded Yam. Say "start order" to begin.';
    setOrderStatus(welcomeMessage);
    await speak(welcomeMessage);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log('Recognition already started');
      }
    }
  }, [speak]);

  useEffect(() => {
    // Auto-start when component mounts
    const timer = setTimeout(() => {
      startVoiceInteraction();
    }, 1000);

    return () => clearTimeout(timer);
  }, [startVoiceInteraction]);

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">🍚 Ile Iyan</h1>
        <h2 className="subtitle">Voice-Controlled Food Ordering</h2>
        
        <div className="card">
          <div className="food-item">
            <h3>Today's Special</h3>
            <div className="item-name">Iyan (Pounded Yam)</div>
          </div>
          
          <div className={`status-indicator ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}>
            {isSpeaking ? '🔊 Speaking...' : isListening ? '🎤 Listening...' : '⏸️ Idle'}
          </div>
          
          {transcript && (
            <div className="transcript">
              <strong>You said:</strong> "{transcript}"
            </div>
          )}
          
          <div className="order-status">
            {orderStatus}
          </div>

          {currentState === 'askingQuantity' && customerName && (
            <div className="order-summary">
              <strong>Customer:</strong> {customerName}
            </div>
          )}

          {currentState === 'confirming' && (
            <div className="order-summary">
              <strong>Customer:</strong> {customerName}<br/>
              <strong>Quantity:</strong> {quantity} plate{quantity > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="instructions">
          <h3>📢 Voice Commands:</h3>
          <ul>
            <li>"Start order" - Begin ordering</li>
            <li>State your name when asked</li>
            <li>Say the number of plates you want</li>
            <li>"Confirm" - Confirm your order</li>
            <li>"Cancel" - Cancel and start over</li>
          </ul>
        </div>

        <div className="note">
          🎙️ Make sure your microphone is enabled and you're using Chrome or Edge browser
        </div>
      </div>
    </div>
  );
}

export default App;
