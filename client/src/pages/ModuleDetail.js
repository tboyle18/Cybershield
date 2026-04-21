import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiPlay, FiHelpCircle, FiRefreshCw, FiLock } from 'react-icons/fi';
import './ModuleDetail.css';

const MAX_ATTEMPTS = 3;
const WINDOW_DAYS = 30;

const moduleData = {
  1: {
    title: 'Phishing Awareness',
    icon: '🎣',
    sections: [
      {
        id: 1,
        title: 'What is Phishing?',
        content: `Phishing is a type of social engineering attack where cybercriminals disguise themselves as legitimate organizations — like banks, tech companies, or government agencies — to trick you into revealing sensitive information.

The term "phishing" comes from "fishing," because attackers cast out bait hoping someone will bite.

**Common goals of phishing attacks:**
- Steal login credentials
- Capture credit card or banking information
- Install malware on your device
- Gain unauthorized access to organizational systems

Phishing can occur through email (most common), text messages (smishing), phone calls (vishing), and fake websites.`,
        quiz: [
          {
            q: 'What is the primary goal of a phishing attack?',
            options: ['To entertain users', 'To steal sensitive information or credentials', 'To improve website performance', 'To send marketing emails'],
            answer: 1,
          },
          {
            q: 'SMS phishing is also known as:',
            options: ['Vishing', 'Smishing', 'Spearing', 'Whaling'],
            answer: 1,
          },
        ],
      },
      {
        id: 2,
        title: 'Recognizing Phishing Emails',
        content: `Phishing emails often contain telltale signs that can help you identify them before you become a victim.

**Red flags to watch for:**

1. **Mismatched or suspicious sender address** — The display name may say "PayPal Support" but the actual email is from "paypal-security@gmail123.com"

2. **Urgent or threatening language** — "Your account will be suspended in 24 hours!" creates panic to override careful thinking.

3. **Generic greetings** — "Dear Customer" instead of your actual name suggests a mass phishing campaign.

4. **Suspicious links** — Hover over links (without clicking) to see the actual URL destination.

5. **Unexpected attachments** — Never open attachments you weren't expecting, especially .exe, .zip, or .docm files.

6. **Poor grammar and spelling** — Many phishing emails contain mistakes that legitimate companies would not make.`,
        quiz: [
          {
            q: 'Which of the following is a red flag in a phishing email?',
            options: ['Your full name in the greeting', 'An email from a known contact', 'Urgent language like "Act now or lose access"', 'A plain text email with no links'],
            answer: 2,
          },
          {
            q: 'Before clicking a link in an email, you should:',
            options: ['Click it quickly to see where it goes', 'Hover over it to preview the actual URL', 'Forward it to a friend', 'Reply to the email asking if it is real'],
            answer: 1,
          },
        ],
      },
    ],
  },
  2: {
    title: 'Password Security',
    icon: '🔐',
    sections: [
      {
        id: 1,
        title: 'Why Password Strength Matters',
        content: `Your password is the first line of defense against unauthorized access to your accounts. A weak password can be cracked by automated tools in seconds.

**Brute force attacks** try every possible combination of characters.
**Dictionary attacks** use lists of common words and passwords.
**Credential stuffing** uses leaked password databases to try known combinations.

**Characteristics of a strong password:**
- At least 12 characters long
- Mix of uppercase, lowercase, numbers, and symbols
- Not based on personal information (birthday, name, etc.)
- Unique — never reused across accounts
- Not a dictionary word or common phrase

The password "P@ssw0rd" is considered weak because it follows a predictable pattern attackers know to try.`,
        quiz: [
          {
            q: 'What is the minimum recommended length for a strong password?',
            options: ['6 characters', '8 characters', '12 characters', '20 characters'],
            answer: 2,
          },
          {
            q: 'Which of these is the strongest password?',
            options: ['password123', 'P@ssword!', 'Tr0ub4dor&3', 'qwerty'],
            answer: 2,
          },
        ],
      },
    ],
  },
};

function storageKey(moduleId, sectionIdx) {
  return `cs_quiz_${moduleId}_${sectionIdx}`;
}

function loadAttempts(moduleId, sectionIdx) {
  try {
    const raw = localStorage.getItem(storageKey(moduleId, sectionIdx));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveAttempts(moduleId, sectionIdx, data) {
  localStorage.setItem(storageKey(moduleId, sectionIdx), JSON.stringify(data));
}

function getRetakeEligibility(attempts) {
  if (!attempts) return { canRetake: true, isFirstAttempt: true, attemptsLeft: MAX_ATTEMPTS, daysLeft: WINDOW_DAYS };
  const now = new Date();
  const first = new Date(attempts.firstAttempt);
  const daysSinceFirst = Math.floor((now - first) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, WINDOW_DAYS - daysSinceFirst);
  if (attempts.count >= MAX_ATTEMPTS) {
    return { canRetake: false, reason: 'limit', attemptsLeft: 0, daysLeft };
  }
  if (daysLeft <= 0) {
    return { canRetake: false, reason: 'window', attemptsLeft: MAX_ATTEMPTS - attempts.count, daysLeft: 0 };
  }
  return { canRetake: true, isFirstAttempt: false, attemptsLeft: MAX_ATTEMPTS - attempts.count, daysLeft };
}

export default function ModuleDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mod = moduleData[id] || moduleData[1];

  const initSection = Math.max(0, Math.min(
    parseInt(searchParams.get('section') || '0', 10),
    mod.sections.length - 1
  ));

  const initAttempts = loadAttempts(id || '1', initSection);
  const initEligibility = getRetakeEligibility(initAttempts);
  const startWithRetake = searchParams.get('retake') === 'true' && initEligibility.canRetake;

  const [currentSection, setCurrentSection] = useState(initSection);
  const [showQuiz, setShowQuiz] = useState(startWithRetake);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(initAttempts);
  const [isNewBest, setIsNewBest] = useState(false);

  const section = mod.sections[currentSection];
  const eligibility = getRetakeEligibility(attempts);

  const switchSection = (i) => {
    setCurrentSection(i);
    setShowQuiz(false);
    setSelected({});
    setSubmitted(false);
    setIsNewBest(false);
    setAttempts(loadAttempts(id || '1', i));
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    section.quiz.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });
    setScore(correct);

    const now = new Date().toISOString();
    const pct = Math.round((correct / section.quiz.length) * 100);
    const prev = loadAttempts(id || '1', currentSection);
    const updated = {
      count: (prev?.count || 0) + 1,
      bestScore: Math.max(correct, prev?.bestScore ?? 0),
      bestTotal: section.quiz.length,
      bestPct: Math.max(pct, prev?.bestPct ?? 0),
      firstAttempt: prev?.firstAttempt || now,
      lastAttempt: now,
    };
    saveAttempts(id || '1', currentSection, updated);
    setAttempts(updated);
    setIsNewBest(prev !== null && correct > (prev.bestScore ?? -1));
    setSubmitted(true);
  };

  const handleRetake = () => {
    setSelected({});
    setSubmitted(false);
    setScore(0);
    setIsNewBest(false);
  };

  const nextSection = () => {
    if (currentSection < mod.sections.length - 1) {
      switchSection(currentSection + 1);
    }
  };

  const renderQuizCta = () => {
    if (!eligibility.canRetake) {
      if (eligibility.reason === 'limit') {
        return (
          <div className="quiz-blocked">
            <FiLock className="blocked-icon" />
            <div>
              <strong>Maximum attempts reached (4.A.1)</strong>
              <p>You have used all {MAX_ATTEMPTS} attempts for this quiz. No further retakes are permitted.</p>
              {attempts && <p className="blocked-best">Your best score: {attempts.bestScore}/{attempts.bestTotal}</p>}
            </div>
          </div>
        );
      }
      return (
        <div className="quiz-blocked">
          <FiLock className="blocked-icon" />
          <div>
            <strong>Retake window closed (4.A.2)</strong>
            <p>The {WINDOW_DAYS}-day retake window for this quiz has closed.</p>
            {attempts && <p className="blocked-best">Your best score: {attempts.bestScore}/{attempts.bestTotal}</p>}
          </div>
        </div>
      );
    }

    return (
      <div className="quiz-cta-area">
        {attempts && (
          <div className="prev-attempt-info">
            <span>Previous best: <strong>{attempts.bestScore}/{attempts.bestTotal}</strong></span>
            <span className="attempt-count">Attempt {attempts.count}/{MAX_ATTEMPTS}</span>
          </div>
        )}
        <button className="btn btn-primary" onClick={() => setShowQuiz(true)}>
          <FiHelpCircle /> {attempts ? `Retake Quiz (${eligibility.attemptsLeft} left)` : 'Take Section Quiz'}
        </button>
      </div>
    );
  };

  const renderRetakeArea = () => {
    const e = getRetakeEligibility(attempts);
    if (e.canRetake) {
      return (
        <div className="retake-area">
          <p className="attempts-remaining">
            {e.attemptsLeft} retake{e.attemptsLeft !== 1 ? 's' : ''} remaining &middot; {e.daysLeft} day{e.daysLeft !== 1 ? 's' : ''} left in window
          </p>
          <button className="btn btn-outline retake-btn" onClick={handleRetake}>
            <FiRefreshCw /> Retake Quiz
          </button>
        </div>
      );
    }
    if (e.reason === 'limit') {
      return (
        <div className="quiz-blocked-inline">
          <FiLock /> Maximum attempts reached — no further retakes permitted
        </div>
      );
    }
    return (
      <div className="quiz-blocked-inline">
        <FiLock /> Retake window has closed
      </div>
    );
  };

  return (
    <div className="module-detail-page">
      <Link to="/modules" className="back-link"><FiArrowLeft /> Back to Modules</Link>

      <div className="module-detail-header">
        <span className="md-emoji">{mod.icon}</span>
        <div>
          <h1>{mod.title}</h1>
          <p>{mod.sections.length} sections</p>
        </div>
      </div>

      {/* Section nav */}
      <div className="section-tabs">
        {mod.sections.map((s, i) => (
          <button
            key={s.id}
            className={`section-tab ${currentSection === i ? 'active' : ''} ${i < currentSection ? 'done' : ''}`}
            onClick={() => switchSection(i)}
          >
            {i < currentSection ? <FiCheckCircle size={14} /> : i + 1}. {s.title}
          </button>
        ))}
      </div>

      <div className="module-detail-body">
        <div className="card content-card">
          <h2>{section.title}</h2>
          <div className="content-text">
            {section.content.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <h4 key={i}>{line.slice(2, -2)}</h4>;
              }
              if (line.startsWith('- ') || line.match(/^\d+\./)) {
                return <p key={i} className="content-list-item">{line}</p>;
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>

          {!showQuiz ? (
            renderQuizCta()
          ) : (
            <div className="quiz-section">
              <h3>Section Quiz</h3>
              {section.quiz.map((q, qi) => (
                <div key={qi} className="quiz-question">
                  <p className="q-text">{qi + 1}. {q.q}</p>
                  <div className="q-options">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setSelected(s => ({ ...s, [qi]: oi }))}
                        className={`q-option
                          ${selected[qi] === oi ? 'selected' : ''}
                          ${submitted && oi === q.answer ? 'correct' : ''}
                          ${submitted && selected[qi] === oi && oi !== q.answer ? 'incorrect' : ''}
                        `}
                      >
                        {submitted && oi === q.answer && <FiCheckCircle />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {!submitted ? (
                <button
                  className="btn btn-primary"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selected).length < section.quiz.length}
                >
                  Submit Quiz
                </button>
              ) : (
                <div className="quiz-result">
                  <div className={`result-score ${score === section.quiz.length ? 'perfect' : score >= section.quiz.length / 2 ? 'pass' : 'fail'}`}>
                    {score}/{section.quiz.length} correct
                  </div>
                  {isNewBest && (
                    <div className="new-best-banner">🎉 New best score!</div>
                  )}
                  <p>{score === section.quiz.length ? '🎉 Perfect score!' : score >= section.quiz.length / 2 ? '✅ Good job! You passed.' : '❌ Review the material and try again.'}</p>

                  {renderRetakeArea()}

                  {currentSection < mod.sections.length - 1 && (
                    <button className="btn btn-primary" onClick={nextSection} style={{ marginTop: 12 }}>
                      <FiPlay /> Next Section
                    </button>
                  )}
                  {currentSection === mod.sections.length - 1 && score >= section.quiz.length / 2 && (
                    <div className="module-complete">
                      <h3>🏆 Module Complete!</h3>
                      <p>You've finished this module. Great work!</p>
                      <Link to="/progress" className="btn btn-primary">View My Progress</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
