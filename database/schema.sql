-- CyberShield Database Schema
-- PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(30) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee','manager','trainer','admin')),
  department    VARCHAR(100),
  points        INTEGER NOT NULL DEFAULT 0,
  badges_count  INTEGER NOT NULL DEFAULT 0,
  mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training modules metadata
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  icon        VARCHAR(10),
  difficulty  VARCHAR(20) DEFAULT 'Beginner',
  duration_min INTEGER,
  points_max  INTEGER DEFAULT 200,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Module sections
CREATE TABLE sections (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title     VARCHAR(200) NOT NULL,
  content   TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Quiz questions
CREATE TABLE quiz_questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,
  answer_idx  INTEGER NOT NULL,
  points      INTEGER NOT NULL DEFAULT 10
);

-- User module progress
CREATE TABLE user_module_progress (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

-- Quiz results
CREATE TABLE quiz_results (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  section_id   UUID REFERENCES sections(id) ON DELETE SET NULL,
  score        INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badges
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  icon        VARCHAR(10),
  criteria    TEXT
);

-- User earned badges
CREATE TABLE user_badges (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Knowledge Hub resources
CREATE TABLE knowledge_hub (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('article','video','guide')),
  category     VARCHAR(100),
  difficulty   VARCHAR(20),
  read_time    VARCHAR(20),
  url          TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phishing simulation results
CREATE TABLE simulation_results (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  correct_flags    INTEGER NOT NULL DEFAULT 0,
  false_positives  INTEGER NOT NULL DEFAULT 0,
  missed           INTEGER NOT NULL DEFAULT 0,
  passed           BOOLEAN NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- Seed default modules
INSERT INTO modules (title, description, icon, difficulty, duration_min, points_max, sort_order) VALUES
  ('Phishing Awareness',     'Learn to recognize phishing emails, fake websites, and social engineering attacks.',         '🎣', 'Beginner',     45, 200, 1),
  ('Password Security',       'Understand strong password practices, password managers, and multi-factor authentication.', '🔐', 'Beginner',     35, 150, 2),
  ('Safe Browsing',           'Protect yourself while browsing. HTTPS, malicious ads, and safe download practices.',       '🌐', 'Beginner',     30, 150, 3),
  ('Mobile Device Security',  'Secure your smartphones. Smishing, app permissions, mobile malware, and Wi-Fi risks.',     '📱', 'Intermediate', 25, 150, 4),
  ('Data Privacy',            'How your data is collected, used, and protected. Privacy laws and breach response.',        '🛡️', 'Intermediate', 40, 200, 5);

-- Seed default badges
INSERT INTO badges (name, description, icon, criteria) VALUES
  ('Phish Spotter',         'Completed the Phishing Awareness module',         '🎣', 'Complete module 1'),
  ('Key Keeper',            'Scored 80%+ on Password Security quiz',           '🔐', 'Score 80%+ on module 2 quiz'),
  ('Quick Learner',         'Completed a module in under 30 minutes',          '⚡', 'Complete any module in < 30 min'),
  ('Web Guardian',          'Completed the Safe Browsing module',              '🌐', 'Complete module 3'),
  ('Mobile Defender',       'Completed the Mobile Device Security module',     '📱', 'Complete module 4'),
  ('Privacy Pro',           'Completed the Data Privacy module',               '🛡️', 'Complete module 5'),
  ('Perfect Score',         'Scored 100% on any module quiz',                  '🏅', 'Score 100% on any quiz'),
  ('CyberShield Champion',  'Completed all 5 training modules',                '🏆', 'Complete all 5 modules');
