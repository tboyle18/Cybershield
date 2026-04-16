import React, { useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiSearch, FiInfo } from 'react-icons/fi';
import './ThreatAnalysis.css';

const analyzeText = (input) => {
  const redFlags = [];
  let score = 0;

  if (/urgent|immediately|act now|within 24 hours|suspended|limited|verify now/i.test(input)) {
    redFlags.push('Urgent/threatening language detected');
    score += 25;
  }
  if (/click here|log in now|confirm your|verify your account/i.test(input)) {
    redFlags.push('Suspicious call-to-action phrases');
    score += 20;
  }
  if (/password|credit card|social security|bank account|billing information/i.test(input)) {
    redFlags.push('Requests sensitive personal information');
    score += 25;
  }
  if (/http:\/\//i.test(input)) {
    redFlags.push('Insecure HTTP link detected (not HTTPS)');
    score += 20;
  }
  if (/paypa1|microsofft|g00gle|arnazon|netfl1x/i.test(input)) {
    redFlags.push('Typosquatted brand name detected');
    score += 30;
  }
  if (/dear (customer|user|valued|sir|madam)/i.test(input)) {
    redFlags.push('Generic greeting — not personalized');
    score += 10;
  }
  if (/@(gmail|yahoo|hotmail|outlook)\.(com|net)/i.test(input) && /(paypal|bank|irs|amazon|microsoft)/i.test(input)) {
    redFlags.push('Legitimate brand using free email domain (suspicious)');
    score += 30;
  }
  if (/\.ru|\.tk|\.xyz|\.top|\.info/i.test(input)) {
    redFlags.push('Suspicious top-level domain detected');
    score += 20;
  }

  score = Math.min(score, 100);

  let level, color;
  if (score >= 70) { level = 'High Risk'; color = 'danger'; }
  else if (score >= 35) { level = 'Medium Risk'; color = 'warning'; }
  else { level = 'Low Risk'; color = 'success'; }

  return { score, level, color, redFlags };
};

export default function ThreatAnalysis() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setResult(analyzeText(input));
    setLoading(false);
  };

  return (
    <div className="threat-page">
      <div className="threat-header">
        <h1>Threat Analysis Tool</h1>
        <p>Paste a suspicious email, URL, or message body below to analyze it for phishing indicators.</p>
      </div>

      <div className="threat-layout">
        <div className="card threat-input-card">
          <h3>Paste Content for Analysis</h3>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste email content, a URL, or any suspicious text here...

Example:
From: security@paypa1-alerts.com
Subject: URGENT: Your account has been LIMITED!

Dear Valued Customer, we have noticed unusual activity. Click here immediately to verify: http://paypa1-verify.net/login"
            rows={12}
          />
          <button
            className="btn btn-primary analyze-btn"
            onClick={analyze}
            disabled={loading || !input.trim()}
          >
            {loading ? 'Analyzing...' : <><FiSearch /> Analyze Threat</>}
          </button>
        </div>

        {result && (
          <div className="threat-result">
            <div className={`card risk-score-card risk-${result.color}`}>
              <div className="risk-score-header">
                {result.color === 'danger' ? <FiAlertTriangle /> : result.color === 'warning' ? <FiInfo /> : <FiCheckCircle />}
                <div>
                  <div className="risk-level">{result.level}</div>
                  <div className="risk-score-label">Threat Score</div>
                </div>
                <div className="risk-score-num">{result.score}/100</div>
              </div>
              <div className="risk-bar">
                <div className="risk-fill" style={{ width: `${result.score}%` }} />
              </div>
            </div>

            {result.redFlags.length > 0 ? (
              <div className="card red-flags-card">
                <h3>Red Flags Detected ({result.redFlags.length})</h3>
                <ul className="red-flag-list">
                  {result.redFlags.map((f, i) => (
                    <li key={i}><FiAlertTriangle /> {f}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="card green-card">
                <FiCheckCircle />
                <h3>No significant threats detected</h3>
                <p>This content does not contain common phishing indicators. However, always use caution and verify the sender's identity through official channels.</p>
              </div>
            )}

            <div className="card recommendations-card">
              <h3>Recommendations</h3>
              {result.color === 'danger' && (
                <ul>
                  <li>Do NOT click any links in this content</li>
                  <li>Do NOT reply or provide any personal information</li>
                  <li>Report this to your IT/security team immediately</li>
                  <li>Delete the email and empty your trash</li>
                  <li>If you already clicked a link, change your passwords now</li>
                </ul>
              )}
              {result.color === 'warning' && (
                <ul>
                  <li>Treat this with caution before taking any action</li>
                  <li>Verify the sender's identity through official channels</li>
                  <li>Do not provide sensitive information</li>
                  <li>Contact the supposed sender via a known official method</li>
                </ul>
              )}
              {result.color === 'success' && (
                <ul>
                  <li>This content appears low-risk, but stay vigilant</li>
                  <li>Always verify before clicking links or sharing information</li>
                  <li>Check the actual URL destination by hovering before clicking</li>
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
