import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCpu } from 'react-icons/fi';
import './AIAssistant.css';

const suggestions = [
  "What is phishing?",
  "How do I spot a fake email?",
  "What is MFA?",
  "How do I create a strong password?",
  "What should I do if I click a phishing link?",
];

const botReplies = {
  "what is phishing": "Phishing is a cyberattack where criminals disguise themselves as trustworthy sources (like banks or companies) to trick you into revealing sensitive information like passwords or credit card numbers. They use emails, texts, or fake websites.",
  "how do i spot a fake email": "Look for: mismatched sender addresses, urgent/threatening language, generic greetings, suspicious links (hover before clicking), unexpected attachments, and requests for personal info. Legitimate companies rarely ask for passwords via email.",
  "what is mfa": "Multi-Factor Authentication (MFA) adds a second layer of security beyond your password. After entering your password, you verify your identity through a code sent to your phone, an authenticator app, or biometrics — making it much harder for attackers to access your account.",
  "how do i create a strong password": "Use at least 12 characters combining uppercase, lowercase, numbers, and symbols. Avoid dictionary words and personal info. Use a unique password for every account and consider a password manager like Bitwarden or 1Password.",
  "what should i do if i click a phishing link": "Act fast: 1) Disconnect from the internet, 2) Run an antivirus scan, 3) Change passwords for any accounts that may be affected, 4) Enable MFA on important accounts, 5) Report the incident to your IT/security team, 6) Monitor your accounts for suspicious activity.",
};

function getReply(message) {
  const lower = message.toLowerCase().trim();
  for (const [key, val] of Object.entries(botReplies)) {
    if (lower.includes(key.split(' ')[2] || key.split(' ')[1] || key.split(' ')[0])) {
      return val;
    }
  }
  return "Great question! For detailed guidance on that topic, I recommend checking the Knowledge Hub or completing the relevant training module. Is there something specific about phishing or cybersecurity I can help clarify?";
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm your CyberShield AI Assistant. Ask me anything about phishing, cybersecurity, or the training modules." }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: getReply(msg) }]);
    }, 700);
  };

  return (
    <>
      <button className={`ai-fab ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} title="AI Assistant">
        {open ? <FiX /> : <FiMessageCircle />}
      </button>

      {open && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <FiCpu />
            <div>
              <div className="ai-chat-title">CyberShield AI</div>
              <div className="ai-chat-subtitle">Cybersecurity Assistant</div>
            </div>
            <button onClick={() => setOpen(false)}><FiX /></button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-message ${m.from}`}>
                {m.from === 'bot' && <div className="ai-avatar"><FiCpu /></div>}
                <div className="ai-bubble">{m.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="ai-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="ai-suggestion-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>

          <div className="ai-chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about phishing, security..."
            />
            <button className="ai-send-btn" onClick={() => send()}><FiSend /></button>
          </div>
        </div>
      )}
    </>
  );
}
