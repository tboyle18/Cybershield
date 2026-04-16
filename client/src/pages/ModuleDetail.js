import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiPlay, FiHelpCircle } from 'react-icons/fi';
import './ModuleDetail.css';

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

export default function ModuleDetail() {
  const { id } = useParams();
  const mod = moduleData[id] || moduleData[1];
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const section = mod.sections[currentSection];

  const handleQuizSubmit = () => {
    let correct = 0;
    section.quiz.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const nextSection = () => {
    if (currentSection < mod.sections.length - 1) {
      setCurrentSection(c => c + 1);
      setShowQuiz(false);
      setSelected({});
      setSubmitted(false);
    }
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
            onClick={() => { setCurrentSection(i); setShowQuiz(false); setSelected({}); setSubmitted(false); }}
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
            <button className="btn btn-primary" onClick={() => setShowQuiz(true)}>
              <FiHelpCircle /> Take Section Quiz
            </button>
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
                  <p>{score === section.quiz.length ? '🎉 Perfect score!' : score >= section.quiz.length / 2 ? '✅ Good job! You passed.' : '❌ Review the material and try again.'}</p>
                  {currentSection < mod.sections.length - 1 && (
                    <button className="btn btn-primary" onClick={nextSection}>
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
