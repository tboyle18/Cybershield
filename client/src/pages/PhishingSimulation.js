import React, { useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiMail, FiFlag, FiUser } from 'react-icons/fi';
import './PhishingSimulation.css';

const emails = [
  {
    id: 1,
    from: 'IT Support <it-support@company.com>',
    subject: 'Monthly Security Newsletter - April 2026',
    time: '9:05 AM',
    preview: 'Here is your monthly cybersecurity update from the IT department...',
    body: 'Dear Team,\n\nPlease find this month\'s cybersecurity tips below. Remember to update your passwords regularly and report any suspicious activity to the IT helpdesk.\n\nBest regards,\nIT Support Team',
    isPhishing: false,
    explanation: 'This is a legitimate internal newsletter. The sender domain matches the company, the tone is professional, and there are no suspicious links or urgent demands.',
  },
  {
    id: 2,
    from: 'PayPal Security <security@paypa1-alerts.com>',
    subject: '⚠️ URGENT: Your account has been LIMITED!',
    time: '9:17 AM',
    preview: 'We have noticed unusual activity. Verify your account immediately or it will be suspended...',
    body: 'Dear Valued Customer,\n\nWe have detected UNUSUAL ACTIVITY on your PayPal account. Your account has been LIMITED.\n\nClick here immediately to verify your identity: http://paypa1-verify.net/login\n\nFailure to verify within 24 hours will result in permanent suspension.\n\nPayPal Security Team',
    isPhishing: true,
    redFlags: ['Misspelled domain: paypa1-alerts.com (number 1 instead of letter l)', 'Urgent threatening language', 'Suspicious link: paypa1-verify.net', 'Generic greeting "Valued Customer"', 'Excessive capitalization and emoji for urgency'],
    explanation: 'This is a phishing email. The sender domain uses "paypa1" with the number 1 instead of the letter l — a common trick. The link also goes to a fake domain. Legitimate PayPal emails come from @paypal.com and never threaten immediate suspension.',
  },
  {
    id: 3,
    from: 'HR Department <hr@yourcompany.com>',
    subject: 'Q2 Benefits Enrollment — Action Required',
    time: '10:02 AM',
    preview: 'Open enrollment for Q2 benefits is now available in the employee portal...',
    body: 'Hi Team,\n\nQ2 benefits enrollment is now open. Please log into the employee portal to review and update your benefits selections before the April 30th deadline.\n\nIf you have questions, contact HR at ext. 2400.\n\nHR Department',
    isPhishing: false,
    explanation: 'This is a legitimate HR email. The sender is from the company domain, there are no suspicious links (it references the employee portal, not an external link), and it includes a specific deadline and contact information.',
  },
  {
    id: 4,
    from: 'Microsoft Account Team <no-reply@microsofft-account.info>',
    subject: 'Action Required: Verify your Microsoft account',
    time: '10:45 AM',
    preview: 'Your Microsoft account will be closed. Sign in to prevent this from happening...',
    body: 'Hello,\n\nYour Microsoft account has been flagged for suspicious sign-in activity from an unknown location.\n\nTo secure your account, please verify your identity immediately:\n\n[Verify Account Now] → http://microsofft-secure.info/verify\n\nIf you do not verify within 12 hours, your account will be permanently deleted.\n\nMicrosoft Account Security',
    isPhishing: true,
    redFlags: ['Misspelled domain: microsofft-account.info (double f)', 'Link goes to microsofft-secure.info, not microsoft.com', 'Extreme urgency: "permanently deleted in 12 hours"', 'No personalization — does not use your name', 'Real Microsoft emails come from @microsoft.com'],
    explanation: 'This is a phishing email. The domain "microsofft" has a double "f" — a typosquat of microsoft.com. The link also goes to a non-Microsoft domain. Legitimate Microsoft security emails come from @microsoft.com and link to account.microsoft.com.',
  },
  {
    id: 5,
    from: 'Amazon <shipment-update@amazon.com>',
    subject: 'Your package has been delivered',
    time: '11:30 AM',
    preview: 'Your order #114-9284761 was delivered today at 11:15 AM...',
    body: 'Hello,\n\nYour Amazon order #114-9284761 was delivered today at 11:15 AM to your front door.\n\nIf you did not receive your package, please visit amazon.com/returns to report an issue.\n\nThank you for shopping with Amazon.',
    isPhishing: false,
    explanation: 'This appears to be a legitimate Amazon delivery notification. The sender is from amazon.com, the order number is specific, and any links referenced go to amazon.com directly. If in doubt, log into your Amazon account directly rather than clicking any links.',
  },
];

export default function PhishingSimulation() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [flagged, setFlagged] = useState({});
  const [revealed, setRevealed] = useState({});
  const [simComplete, setSimComplete] = useState(false);

  const openEmail = (email) => setSelectedEmail(email);

  const flagEmail = (email) => {
    setFlagged(f => ({ ...f, [email.id]: !f[email.id] }));
  };

  const revealResult = (email) => {
    setRevealed(r => ({ ...r, [email.id]: true }));
  };

  const finishSim = () => setSimComplete(true);

  const correctFlags = emails.filter(e => e.isPhishing && flagged[e.id]).length;
  const falsePositives = emails.filter(e => !e.isPhishing && flagged[e.id]).length;
  const missed = emails.filter(e => e.isPhishing && !flagged[e.id]).length;
  const passed = correctFlags >= 2 && falsePositives === 0;

  if (simComplete) {
    return (
      <div className="sim-page">
        <div className="card sim-result-card">
          <div className={`sim-result-icon ${passed ? 'pass' : 'fail'}`}>
            {passed ? <FiCheckCircle /> : <FiAlertTriangle />}
          </div>
          <h2>{passed ? 'Simulation Passed!' : 'Simulation Failed'}</h2>
          <p>{passed ? 'Well done! You successfully identified the phishing emails.' : 'You missed some phishing emails. Review the results below.'}</p>
          <div className="sim-score-grid">
            <div className="sim-score-item correct"><span>{correctFlags}</span><label>Phishing Caught</label></div>
            <div className="sim-score-item missed"><span>{missed}</span><label>Phishing Missed</label></div>
            <div className="sim-score-item false"><span>{falsePositives}</span><label>False Positives</label></div>
          </div>
          <h3 style={{ marginTop: 24 }}>Email-by-Email Results</h3>
          {emails.map(e => (
            <div key={e.id} className={`result-email-row ${e.isPhishing ? 'was-phishing' : 'was-legit'}`}>
              <div className="result-email-info">
                <span className="result-label">{e.isPhishing ? '🎣 PHISHING' : '✅ LEGITIMATE'}</span>
                <strong>{e.subject}</strong>
                <span className="result-from">{e.from}</span>
              </div>
              {e.isPhishing && (
                <div className="result-flags">
                  <strong>Red Flags:</strong>
                  <ul>{e.redFlags?.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              <p className="result-explanation">{e.explanation}</p>
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => {
            setFlagged({}); setRevealed({}); setSimComplete(false); setSelectedEmail(null);
          }}>Restart Simulation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sim-page">
      <div className="sim-header">
        <div>
          <h1>Phishing Simulation Inbox</h1>
          <p>Review each email and flag the ones you believe are phishing attempts. Then submit when ready.</p>
        </div>
        <button className="btn btn-primary" onClick={finishSim}>Submit Results</button>
      </div>

      <div className="sim-layout">
        {/* Email List */}
        <div className="sim-email-list">
          {emails.map(e => (
            <div
              key={e.id}
              className={`sim-email-item ${selectedEmail?.id === e.id ? 'selected' : ''} ${flagged[e.id] ? 'flagged' : ''}`}
              onClick={() => openEmail(e)}
            >
              <div className="sim-email-avatar"><FiUser /></div>
              <div className="sim-email-info">
                <div className="sim-email-top">
                  <span className="sim-email-from">{e.from.split('<')[0].trim()}</span>
                  <span className="sim-email-time">{e.time}</span>
                </div>
                <div className="sim-email-subject">{e.subject}</div>
                <div className="sim-email-preview">{e.preview}</div>
              </div>
              {flagged[e.id] && <FiFlag className="sim-flagged-icon" />}
            </div>
          ))}
        </div>

        {/* Email Detail */}
        <div className="sim-email-detail">
          {selectedEmail ? (
            <div className="card sim-email-content">
              <div className="sim-email-content-header">
                <div>
                  <h3>{selectedEmail.subject}</h3>
                  <p className="sim-content-from"><FiMail size={13} /> {selectedEmail.from}</p>
                </div>
                <div className="sim-email-actions">
                  <button
                    className={`btn ${flagged[selectedEmail.id] ? 'btn-danger' : 'btn-outline'}`}
                    onClick={() => flagEmail(selectedEmail)}
                  >
                    <FiFlag /> {flagged[selectedEmail.id] ? 'Flagged as Phishing' : 'Flag as Phishing'}
                  </button>
                </div>
              </div>

              <div className="sim-email-body">
                {selectedEmail.body.split('\n').map((line, i) => (
                  <p key={i}>{line || <br />}</p>
                ))}
              </div>

              {!revealed[selectedEmail.id] ? (
                <button className="btn btn-outline" onClick={() => revealResult(selectedEmail)}>
                  Reveal Answer
                </button>
              ) : (
                <div className={`sim-reveal-panel ${selectedEmail.isPhishing ? 'phishing' : 'legit'}`}>
                  <div className="reveal-title">
                    {selectedEmail.isPhishing ? <><FiAlertTriangle /> PHISHING EMAIL</> : <><FiCheckCircle /> LEGITIMATE EMAIL</>}
                  </div>
                  {selectedEmail.isPhishing && selectedEmail.redFlags && (
                    <div className="reveal-flags">
                      <strong>Red Flags Detected:</strong>
                      <ul>{selectedEmail.redFlags.map((r, i) => <li key={i}>{r}</li>)}</ul>
                    </div>
                  )}
                  <p>{selectedEmail.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="sim-email-placeholder">
              <FiMail size={48} />
              <p>Select an email to view it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
