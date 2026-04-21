import React, { useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiMail, FiUser, FiPlay } from 'react-icons/fi';
import './PhishingSimulation.css';

const PASS_THRESHOLD = 8;
const FAIL_THRESHOLD = 3;
const TOTAL_PHISHING = 10;

const ALL_EMAILS = [
  // ── PHISHING (10) ──────────────────────────────────────────────────────────
  {
    id: 1, isPhishing: true,
    from: 'PayPal Security <security@paypa1-alerts.net>',
    subject: '⚠️ URGENT: Your PayPal Account Has Been Limited',
    time: '8:02 AM',
    preview: 'Unusual activity detected. Verify your account immediately to avoid suspension...',
    body: `Dear Valued Customer,

We have detected UNUSUAL ACTIVITY on your PayPal account. Your account access has been LIMITED.

Click the link below to verify your identity immediately:
→ http://paypa1-secure-verify.net/account/restore

You must complete verification within 24 hours or your account will be permanently suspended.

PayPal Security Team`,
    redFlags: [
      'Sender domain: paypa1-alerts.net (number "1" instead of letter "l")',
      'Link goes to paypa1-secure-verify.net, not paypal.com',
      'Extreme urgency: "permanently suspended in 24 hours"',
      'Generic greeting "Valued Customer" — not your name',
      'Excessive capitalization to manufacture panic',
    ],
    explanation: 'Classic PayPal spoof. The domain uses the number "1" to mimic the letter "l" — a typosquat. Legitimate PayPal emails always come from @paypal.com and link to paypal.com.',
  },
  {
    id: 2, isPhishing: true,
    from: 'Microsoft Account Team <no-reply@microsofft-account.info>',
    subject: 'Action Required: Unusual sign-in to your Microsoft account',
    time: '8:29 AM',
    preview: 'Your Microsoft account will be closed unless you verify now...',
    body: `Hello,

Your Microsoft account was signed in from an unrecognized device in Lagos, Nigeria.

If this wasn't you, verify your account immediately:
→ http://microsofft-account.info/verify-now

Failure to verify within 12 hours will result in permanent account deletion.

Microsoft Security Team`,
    redFlags: [
      'Domain: microsofft-account.info — "microsofft" has a double f',
      'Link goes to microsofft-account.info, not microsoft.com',
      '"Permanent account deletion in 12 hours" — extreme urgency',
      'No personalization — does not use your name or email',
      'Legitimate Microsoft emails come from @accountprotection.microsoft.com',
    ],
    explanation: 'Domain typosquat — "microsofft" with two f\'s. Real Microsoft security alerts link to account.microsoft.com and come from microsoft.com domains.',
  },
  {
    id: 3, isPhishing: true,
    from: 'IT Help Desk <helpdesk@company-it-support.net>',
    subject: 'IMMEDIATE ACTION: Your password expires in 2 hours',
    time: '8:55 AM',
    preview: 'Your corporate password will expire. Reset it now to maintain access...',
    body: `Hi Employee,

Your corporate account password is set to expire in 2 hours. Failure to reset will lock you out of all company systems.

Click below to reset your password now:
→ http://company-it-support.net/password-reset

Use your current username and password to authenticate before resetting.

IT Help Desk`,
    redFlags: [
      'Sender is company-it-support.net, not the actual company domain',
      'Asks you to enter your CURRENT password on an external site — credential harvesting',
      'Extreme urgency: "expires in 2 hours" with threat of lockout',
      'Legitimate IT resets go through your company\'s internal SSO portal',
      'No IT ticket number or internal reference',
    ],
    explanation: 'Credential harvesting attack. The critical red flag: it asks for your existing password. Legitimate password resets never ask for your current credentials — they send a one-time reset link.',
  },
  {
    id: 4, isPhishing: true,
    from: 'Bank of America Fraud Dept <fraud-alert@bankofamerica-security.com>',
    subject: 'Suspicious Transaction Detected — Immediate Verification Required',
    time: '9:10 AM',
    preview: 'A $2,847.00 transaction was flagged on your account. Confirm or dispute now...',
    body: `Dear Account Holder,

A transaction of $2,847.00 was flagged as suspicious on your Bank of America account.

Merchant: AMAZON MARKETPLACE
Date: Today, 7:58 AM

To confirm or dispute this transaction, please verify your identity:
→ http://bankofamerica-security.com/dispute

If you do not respond within 1 hour, your account will be frozen.

Bank of America Fraud Department`,
    redFlags: [
      'Sender domain: bankofamerica-security.com — real BofA uses bankofamerica.com',
      'Link goes to bankofamerica-security.com, a hyphenated look-alike domain',
      '"Account frozen in 1 hour" — extreme artificial urgency',
      'Generic "Dear Account Holder" — not your name',
      'Real BofA fraud alerts come from @bankofamerica.com',
    ],
    explanation: 'Look-alike domain attack using "bankofamerica-security.com" with an added hyphen and word. Always log into your bank directly — never through email links.',
  },
  {
    id: 5, isPhishing: true,
    from: 'DocuSign <docu-sign-noreply@docusign-docs.net>',
    subject: 'You have a document waiting for your signature',
    time: '10:08 AM',
    preview: 'Your signature is required. This document will expire in 24 hours...',
    body: `Hello,

Sarah Johnson has sent you a document for signature via DocuSign.

Document: "Q2 2026 Contract Amendment"
Expires: 24 hours from now

Review and sign the document:
→ http://docusign-docs.net/sign/d92k3

This link will expire. If you miss the deadline, contact your sender.

DocuSign`,
    redFlags: [
      'Sender domain: docusign-docs.net — real DocuSign uses docusign.com',
      'Link goes to docusign-docs.net, a fake site',
      '"Sarah Johnson" is vague — no company name or context to verify',
      '24-hour expiration creates artificial urgency',
      'Real DocuSign emails come from @docusign.com and link to docusign.com',
    ],
    explanation: 'DocuSign spoofing is extremely common. The domain "docusign-docs.net" mimics DocuSign. Real DocuSign emails come from docusign.com. If unexpected, verify directly with the purported sender.',
  },
  {
    id: 6, isPhishing: true,
    from: 'IRS Refund Department <refund@irs-gov-refunds.com>',
    subject: 'Your Federal Tax Refund of $1,432.00 Is Pending',
    time: '10:45 AM',
    preview: 'The IRS has issued a refund. Provide your banking details to receive it...',
    body: `Dear Taxpayer,

After a review of your 2025 federal tax return, the IRS has determined you are owed a refund of $1,432.00.

To receive your refund, you must verify your banking information within 48 hours:
→ http://irs-gov-refunds.com/claim-refund

You will need to provide your Social Security Number and bank routing information.

Internal Revenue Service
Tax Refund Department`,
    redFlags: [
      'The IRS is irs.gov — this email is from irs-gov-refunds.com, a fake domain',
      'The IRS NEVER contacts taxpayers by email — they use postal mail only',
      'Requests SSN and bank routing info via email link (identity theft)',
      '"Must verify in 48 hours" — urgency tactic',
      'IRS refunds are deposited to your filed bank account automatically',
    ],
    explanation: 'IRS impersonation is a perennial scam. Critical rule: the IRS never emails taxpayers. If you\'re owed a refund, it\'s deposited to the bank account on your tax return automatically.',
  },
  {
    id: 7, isPhishing: true,
    from: 'LinkedIn <security-noreply@linkedln-security.com>',
    subject: 'Your LinkedIn account: Unusual sign-in blocked',
    time: '11:20 AM',
    preview: 'We blocked a sign-in attempt to your LinkedIn account from Romania...',
    body: `Hi,

We blocked an unusual sign-in attempt to your LinkedIn account.

Location: Bucharest, Romania
Device: Windows PC
Time: 10:58 AM today

If this was not you, secure your account immediately:
→ http://linkedln-security.com/secure-account

Your account will be restricted if not reviewed within 6 hours.

LinkedIn Security Team`,
    redFlags: [
      'Domain: linkedln-security.com — "linkedln" swaps the i and l positions',
      'Link also goes to linkedln-security.com, not linkedin.com',
      'Real LinkedIn security emails come from @linkedin.com',
      '"Account restricted in 6 hours" — false urgency',
    ],
    explanation: 'Notice "linkedln" — the letters i and l are transposed (LinkedIn → LinkedlN). This is a subtle character transposition attack. Always verify by going directly to linkedin.com.',
  },
  {
    id: 8, isPhishing: true,
    from: 'FedEx Delivery <tracking@fedex-delivery-notification.com>',
    subject: 'FedEx: Your package is on hold — customs fee required',
    time: '12:05 PM',
    preview: 'Your package #FX384920173 requires a small customs clearance fee...',
    body: `Dear Customer,

Your FedEx package #FX384920173 has been held at customs.

A customs clearance fee of $3.49 is required before delivery can proceed.

Pay the fee to release your package:
→ http://fedex-delivery-notification.com/pay-fee/FX384920173

Failure to pay within 24 hours will result in your package being returned.

FedEx Customer Service`,
    redFlags: [
      'Sender domain: fedex-delivery-notification.com — real FedEx uses fedex.com',
      'Requesting payment via email link — FedEx uses its official app or website',
      'Small "customs fee" pages typically capture full card details',
      'Package number FX384920173 is not trackable on fedex.com',
      'Real FedEx notifications come from @fedex.com',
    ],
    explanation: 'The "customs fee" scam targets people awaiting deliveries. The goal is to steal payment card details. Legitimate customs fees are handled via official carrier apps or FedEx.com directly.',
  },
  {
    id: 9, isPhishing: true,
    from: 'Netflix <billing-noreply@netflix-billing-update.com>',
    subject: 'Your Netflix membership will be cancelled — payment failed',
    time: '1:40 PM',
    preview: 'We couldn\'t process your payment. Update your billing info to continue...',
    body: `Hi,

We were unable to process your Netflix payment for this billing cycle.

Your account will be cancelled in 48 hours unless your payment information is updated.

Update your payment details now:
→ http://netflix-billing-update.com/update-payment

Once updated, your membership will continue uninterrupted.

Netflix Support`,
    redFlags: [
      'Domain: netflix-billing-update.com — real Netflix uses netflix.com',
      'Link goes to netflix-billing-update.com, designed to steal card info',
      '"Account cancelled in 48 hours" — urgency tactic',
      'Real Netflix payment failure emails come from @netflix.com and link to netflix.com/account',
    ],
    explanation: 'Payment failure phishing harvests credit card details. Real Netflix billing emails come from @netflix.com. If in doubt, log into your Netflix account directly.',
  },
  {
    id: 10, isPhishing: true,
    from: 'Dropbox <storage-alert@dropbox-accounts.net>',
    subject: 'Action Required: Your Dropbox storage is 100% full — account suspended',
    time: '3:15 PM',
    preview: 'Your Dropbox account has been suspended due to storage overflow...',
    body: `Hello,

Your Dropbox account storage is 100% full and your account has been suspended.

You will lose all your stored files within 24 hours unless you verify your account and upgrade:
→ http://dropbox-accounts.net/upgrade-now

Enter your email and password to restore access immediately.

Dropbox Support Team`,
    redFlags: [
      'Domain: dropbox-accounts.net — real Dropbox uses dropbox.com',
      'Requests email and password on an external non-Dropbox site',
      '"Lose all files in 24 hours" — extreme fear-based urgency',
      'Dropbox never suspends accounts for full storage — it just stops syncing',
      'Real Dropbox communications come from @dropbox.com',
    ],
    explanation: 'Storage full scams prey on fear of data loss. Dropbox never deletes files for storage issues — it stops new uploads. This is designed to steal your Dropbox login credentials.',
  },

  // ── LEGITIMATE (20) ────────────────────────────────────────────────────────
  {
    id: 11, isPhishing: false,
    from: 'IT Support <it-support@yourcompany.com>',
    subject: 'Monthly Security Newsletter — April 2026',
    time: '9:05 AM',
    preview: 'Your monthly cybersecurity update from the IT department...',
    body: `Hi Team,

Here are this month's cybersecurity reminders from IT:

• Update your passwords every 90 days using the company password manager
• Enable two-factor authentication on all work accounts
• Report suspicious emails to security@yourcompany.com

Upcoming: Annual security training is scheduled for May 14th. Watch for a calendar invite.

IT Support Team
it-support@yourcompany.com | Ext. 4200`,
    explanation: 'Legitimate internal newsletter. Sent from the company domain, no suspicious links, references internal resources and a known helpdesk extension.',
  },
  {
    id: 12, isPhishing: false,
    from: 'HR Department <hr@yourcompany.com>',
    subject: 'Q2 Benefits Enrollment — Deadline April 30',
    time: '9:32 AM',
    preview: 'Open enrollment for Q2 benefits is now available in the employee portal...',
    body: `Hi Team,

Q2 benefits open enrollment runs April 21–30.

Log into the employee portal at hr.yourcompany.com to review and update:
• Health, dental, and vision coverage
• 401(k) contribution changes
• Dependent care FSA elections

For help, contact HR at hr@yourcompany.com or call ext. 2400.

HR Department`,
    explanation: 'Legitimate HR email. From the company domain, references the internal HR portal, includes a specific deadline and direct contact information.',
  },
  {
    id: 13, isPhishing: false,
    from: 'Amazon <shipment-update@amazon.com>',
    subject: 'Your package has been delivered',
    time: '10:15 AM',
    preview: 'Your order #114-9284761 was delivered today at 10:02 AM...',
    body: `Hello,

Your Amazon order #114-9284761 was delivered today at 10:02 AM to your front door.

If you didn't receive your package or have an issue, visit amazon.com/returns.

Thank you for shopping with Amazon.`,
    explanation: 'Legitimate Amazon delivery notification. Sent from amazon.com, contains a specific order number, any referenced links go to amazon.com directly.',
  },
  {
    id: 14, isPhishing: false,
    from: 'James Chen <j.chen@yourcompany.com>',
    subject: 'Re: Team standup moved to 10:30 AM tomorrow',
    time: '10:28 AM',
    preview: 'Moving tomorrow\'s standup to 10:30 to accommodate the West Coast team...',
    body: `Hi everyone,

Quick note — I'm moving tomorrow's standup from 9:00 to 10:30 AM to accommodate the West Coast team joining for the sprint review.

The Zoom link stays the same. No prep needed, just our regular updates.

Thanks,
James Chen
Engineering Manager`,
    explanation: 'Legitimate internal email from a colleague. From a company email address, references a known internal meeting, no links or requests for credentials.',
  },
  {
    id: 15, isPhishing: false,
    from: 'IT Operations <it-ops@yourcompany.com>',
    subject: 'Scheduled Maintenance: VPN Downtime Saturday 2–4 AM',
    time: '10:50 AM',
    preview: 'Planned maintenance on the VPN will cause a brief outage Saturday morning...',
    body: `Team,

We have scheduled maintenance on the corporate VPN this Saturday, April 26, from 2:00 AM to 4:00 AM.

During this window, remote access will be unavailable. Please plan accordingly.

If you have critical work scheduled during this time, contact it-ops@yourcompany.com by Friday EOD.

IT Operations`,
    explanation: 'Legitimate IT maintenance notice. Sent from the company domain, references a specific date and time, no links or credential requests.',
  },
  {
    id: 16, isPhishing: false,
    from: 'Finance Team <finance@yourcompany.com>',
    subject: 'Q2 Expense Reports Due May 2',
    time: '11:05 AM',
    preview: 'Reminder: Q2 expense reports must be submitted by May 2 via Concur...',
    body: `Hi all,

This is a reminder that Q2 expense reports are due by Friday, May 2nd.

Please submit all receipts through the Concur portal at concur.yourcompany.com. Anything submitted after the deadline will roll to Q3.

Questions? Reply to this email or contact payables@yourcompany.com.

Finance Team`,
    explanation: 'Legitimate finance reminder. From the company domain, references the internal Concur portal by its internal URL, no suspicious external links.',
  },
  {
    id: 17, isPhishing: false,
    from: 'Sarah Mitchell <ceo@yourcompany.com>',
    subject: 'Company All-Hands: Thursday April 24 at 3 PM',
    time: '11:30 AM',
    preview: 'Join us for the Q2 all-hands meeting this Thursday at 3 PM...',
    body: `Team,

Our Q2 All-Hands is this Thursday, April 24 at 3:00 PM in the Main Conference Room (or via Zoom — link in your calendar invite).

Agenda:
• Q1 results review
• Product roadmap update
• Open Q&A

See you there!

Sarah Mitchell
CEO, YourCompany`,
    explanation: 'Legitimate executive communication. From the CEO\'s company email, references a calendar invite already sent, no requests for credentials or payments.',
  },
  {
    id: 18, isPhishing: false,
    from: 'Priya Patel <p.patel@yourcompany.com>',
    subject: 'Customer onboarding project — updated files in SharePoint',
    time: '12:10 PM',
    preview: 'I\'ve uploaded the revised onboarding documents to the SharePoint folder...',
    body: `Hi,

I've finished updating the customer onboarding templates. All files are in our SharePoint folder: Documents > Customer Success > Onboarding > 2026.

Key changes:
• Updated welcome email templates
• Revised 30-day check-in checklist
• New integration guide for API customers

Let me know if you have questions before our Thursday sync.

Priya`,
    explanation: 'Legitimate colleague email. References a specific internal SharePoint path (not an external link), from a company domain, context-appropriate content.',
  },
  {
    id: 19, isPhishing: false,
    from: 'IT Support <it-support@yourcompany.com>',
    subject: 'New VPN Client Available — Update by April 30',
    time: '12:45 PM',
    preview: 'An updated VPN client is available. Please update before April 30...',
    body: `Hi Team,

We've released an updated VPN client (v4.8.1) with important security patches.

To update:
1. Open the company self-service portal at software.yourcompany.com
2. Search for "VPN Client"
3. Click "Update"

This update is required before April 30. For help, contact the IT helpdesk at ext. 4200.

IT Support`,
    explanation: 'Legitimate IT notice. Directs you to the internal software portal, not an external link. From the company IT domain, includes a helpdesk extension for verification.',
  },
  {
    id: 20, isPhishing: false,
    from: 'HR Department <hr@yourcompany.com>',
    subject: 'Annual Performance Review Cycle Begins May 5',
    time: '1:00 PM',
    preview: 'The annual performance review process kicks off May 5 in Lattice...',
    body: `Hi Team,

The 2026 annual performance review cycle begins May 5th.

You will receive a calendar invite with a link to your review in Lattice (our performance management platform). Reviews are due by May 23.

For questions, see the HR wiki at wiki.yourcompany.com/performance-reviews or contact hr@yourcompany.com.

HR Team`,
    explanation: 'Legitimate HR communication. References internal tools (Lattice, HR wiki), from the company HR email, provides direct contact info for verification.',
  },
  {
    id: 21, isPhishing: false,
    from: 'Office Facilities <facilities@yourcompany.com>',
    subject: 'Kitchen Renovation: 3rd Floor Kitchen Closed April 22–25',
    time: '1:20 PM',
    preview: 'The 3rd floor kitchen will be closed this week for renovations...',
    body: `Hi Team,

The 3rd floor kitchen will be closed Tuesday April 22 through Friday April 25 for renovation work.

During this time, please use the kitchens on floors 1, 2, or 4.

We apologize for the inconvenience. The renovation will include new appliances and updated seating.

Facilities Management`,
    explanation: 'Routine facilities announcement. From the company domain, contains no links, no requests, purely informational.',
  },
  {
    id: 22, isPhishing: false,
    from: 'Alex Rivera <a.rivera@yourcompany.com>',
    subject: 'Team happy hour — Friday 5 PM at The Rail',
    time: '1:45 PM',
    preview: 'Team happy hour this Friday at The Rail on 5th Street, 5 PM...',
    body: `Hey team,

We're doing a team happy hour this Friday, April 25 at 5:00 PM.

Location: The Rail, 412 5th Street (a short walk from the office)

First round is on me. Hope to see everyone there! RSVP not required but appreciated so I can reserve space — just reply to this email.

Alex`,
    explanation: 'Legitimate casual colleague email. From a company email address, no links, no requests for credentials, social invitation with no urgency.',
  },
  {
    id: 23, isPhishing: false,
    from: 'Legal & Compliance <legal@yourcompany.com>',
    subject: 'Required: Annual Compliance Training Due May 16',
    time: '2:00 PM',
    preview: 'Your annual compliance training must be completed by May 16...',
    body: `Hi Team,

All employees are required to complete the annual compliance training by May 16, 2026.

Access the training through the Learning Management System at learn.yourcompany.com.

Estimated time: 45 minutes. Completion is reported to the board.

Questions? Contact legal@yourcompany.com.

Legal & Compliance Team`,
    explanation: 'Legitimate compliance training notice. From the company legal domain, references the internal LMS by its internal URL, no suspicious external links.',
  },
  {
    id: 24, isPhishing: false,
    from: 'IT Support <it-support@yourcompany.com>',
    subject: 'Chrome Security Update Required — Please Update Today',
    time: '2:20 PM',
    preview: 'Google Chrome has a critical security update. Update via Chrome\'s own menu...',
    body: `Hi Team,

Google has released a critical security update for Chrome (v124.0.6367.119) that addresses an actively exploited vulnerability.

Please update Chrome today using Chrome's built-in updater:
1. Open Chrome
2. Click the three-dot menu → Help → About Google Chrome
3. Chrome will check for and install updates automatically

If you have trouble, use the Software Center at software.yourcompany.com.

IT Security`,
    explanation: 'Legitimate IT security notice. Gives you instructions to update through Chrome\'s own menu — no external links to click. From the company IT domain.',
  },
  {
    id: 25, isPhishing: false,
    from: 'Marketing <marketing@yourcompany.com>',
    subject: 'Updated Brand Guidelines Now Available in Confluence',
    time: '2:45 PM',
    preview: 'The 2026 brand guidelines have been updated. Access them in Confluence...',
    body: `Hi everyone,

We've updated the company brand guidelines for 2026. Key changes include updated logo usage rules, new color palette hex codes, and revised presentation templates.

Access the full guidelines in Confluence at docs.yourcompany.com/brand.

If you use company templates, please download the updated versions from the same page.

Marketing Team`,
    explanation: 'Legitimate internal communication. References internal Confluence documentation by its internal URL. From the company marketing domain.',
  },
  {
    id: 26, isPhishing: false,
    from: 'Payroll <payroll@yourcompany.com>',
    subject: 'Reminder: Verify Your Direct Deposit in Workday by April 28',
    time: '3:00 PM',
    preview: 'Please confirm your direct deposit information is current in Workday...',
    body: `Hi Team,

As part of our annual payroll data verification, please confirm your direct deposit information is current in Workday by April 28.

Log into Workday at workday.yourcompany.com → Personal → Payment Elections.

No action is needed if your banking information hasn't changed. Questions? Contact payroll@yourcompany.com or call ext. 2601.

Payroll Team`,
    explanation: 'Legitimate payroll notice. Directs you to the internal Workday system by its internal URL — not an external link. From the company payroll domain.',
  },
  {
    id: 27, isPhishing: false,
    from: 'HR Department <hr@yourcompany.com>',
    subject: 'PTO Policy Update — New Rollover Rules Effective May 1',
    time: '3:20 PM',
    preview: 'Updated PTO rollover rules take effect May 1. See the details inside...',
    body: `Hi Team,

Effective May 1, 2026, the PTO rollover policy is changing:

• Old policy: Up to 5 days rollover
• New policy: Up to 10 days rollover, with a 15-day maximum cap

Your current PTO balance is visible in Workday. The full policy is on the HR wiki at wiki.yourcompany.com/pto.

Questions? Contact hr@yourcompany.com.

HR Department`,
    explanation: 'Legitimate policy update. From the company HR domain, references internal tools (Workday, HR wiki), no suspicious links or credential requests.',
  },
  {
    id: 28, isPhishing: false,
    from: 'IT Support <it-support@yourcompany.com>',
    subject: 'Zoom Updated to v6.3 — Restart Required',
    time: '3:40 PM',
    preview: 'Zoom has been automatically updated on your machine. Restart to complete...',
    body: `Hi,

Zoom has been automatically updated to version 6.3 on your company machine via endpoint management.

Action needed: Please restart Zoom at your next convenience to complete the update.

No download or installation is required on your part.

IT Support`,
    explanation: 'Legitimate IT notification. Informs about an automatic update that already happened, no links to click, no credential requests.',
  },
  {
    id: 29, isPhishing: false,
    from: 'Rachel Kim <r.kim@yourcompany.com>',
    subject: 'Q2 Planning Doc — Please Add Your Section Before Thursday',
    time: '4:00 PM',
    preview: 'I\'ve shared the Q2 planning document in Google Drive. Please add your input...',
    body: `Hi,

The Q2 planning doc is ready for your input. I've shared it with you in Google Drive (check "Shared with me").

Please add your team's priorities and key initiatives by Wednesday EOD so we can review together Thursday.

Let me know if you can't find it.

Rachel Kim
Head of Product`,
    explanation: 'Legitimate colleague email. References Google Drive (shared directly, not through an email link), from the company domain, no urgency or credential requests.',
  },
  {
    id: 30, isPhishing: false,
    from: 'IT Support <it-support@yourcompany.com>',
    subject: 'New Hire IT Onboarding Checklist',
    time: '4:30 PM',
    preview: 'Complete your IT onboarding checklist in your first week...',
    body: `Hi,

Welcome to the team! Here's your IT onboarding checklist for your first week:

✅ Set up MFA on your company account at accounts.yourcompany.com
✅ Install required software via the Software Center at software.yourcompany.com
✅ Connect to the VPN — guide at it-wiki.yourcompany.com/vpn-setup
✅ Review the Acceptable Use Policy at policy.yourcompany.com/aup

Questions? IT helpdesk is at ext. 4200 or it-support@yourcompany.com.

IT Support`,
    explanation: 'Legitimate IT onboarding email. References only internal company URLs (yourcompany.com subdomains), from the company IT domain.',
  },
];

export default function PhishingSimulation() {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'active' | 'complete'
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [flagged, setFlagged] = useState({});
  const [terminationReason, setTerminationReason] = useState(null); // 'passed' | 'failed'
  const [notification, setNotification] = useState(null);

  const phishingEmails = emails.filter(e => e.isPhishing);
  const legitEmails = emails.filter(e => !e.isPhishing);
  const correctFlags = phishingEmails.filter(e => flagged[e.id]).length;
  const falsePositives = legitEmails.filter(e => flagged[e.id]).length;
  const missed = phishingEmails.filter(e => !flagged[e.id]).length;

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const startSim = () => {
    const shuffled = [...ALL_EMAILS].sort(() => Math.random() - 0.5);
    setEmails(shuffled);
    setFlagged({});
    setSelectedEmail(null);
    setTerminationReason(null);
    setPhase('active');
  };

  const flagEmail = (email) => {
    // 9A1 — already flagged: log and notify
    if (flagged[email.id]) {
      showNotification('This email has already been flagged and recorded.', 'info');
      return;
    }

    const newFlagged = { ...flagged, [email.id]: true };
    setFlagged(newFlagged);

    const newCorrect = emails.filter(e => e.isPhishing && newFlagged[e.id]).length;
    const newFalsePos = emails.filter(e => !e.isPhishing && newFlagged[e.id]).length;

    if (email.isPhishing) {
      // Step 8 — correct detection
      if (newCorrect >= PASS_THRESHOLD) {
        // Step 12 — threshold reached, auto-terminate with pass
        showNotification(`Phishing email detected! ${newCorrect}/${PASS_THRESHOLD} — Simulation complete.`, 'correct');
        setTerminationReason('passed');
        setTimeout(() => setPhase('complete'), 900);
      } else {
        showNotification(`Phishing email detected. ${newCorrect} of ${PASS_THRESHOLD} required to pass.`, 'correct');
      }
    } else {
      // 7A3 — false positive
      if (newFalsePos >= FAIL_THRESHOLD) {
        // 7A3 — fail threshold reached, auto-terminate with fail
        showNotification(`False positive recorded. Limit of ${FAIL_THRESHOLD} reached — Simulation ended.`, 'warning');
        setTerminationReason('failed');
        setTimeout(() => setPhase('complete'), 900);
      } else {
        showNotification(`False positive recorded. ${newFalsePos} of ${FAIL_THRESHOLD} allowed.`, 'warning');
      }
    }
  };

  // ── Idle / Start screen ──────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="sim-page">
        <div className="sim-start-screen">
          <div className="card sim-start-card">
            <div className="sim-start-icon">🎣</div>
            <h1>Phishing Simulation</h1>
            <p className="sim-start-desc">
              You will be presented with a simulated inbox containing <strong>30 emails</strong> — 10 planted phishing emails mixed among 20 legitimate messages. Your job is to identify the phishing emails using the hook button.
            </p>
            <div className="sim-rules-grid">
              <div className="sim-rule-item pass-rule">
                <span>Pass Condition</span>
                <strong>Flag 8 out of 10 phishing emails</strong>
              </div>
              <div className="sim-rule-item fail-rule">
                <span>Fail Condition</span>
                <strong>3 or more false positives</strong>
              </div>
            </div>
            <ul className="sim-instructions">
              <li>Browse the inbox and open each email to read it carefully</li>
              <li>Click <strong>🪝 Hook as Phishing</strong> on any email you identify as a threat</li>
              <li>Flags are final — they cannot be removed once submitted</li>
              <li>The simulation ends automatically when the pass or fail threshold is reached</li>
            </ul>
            <button className="btn btn-primary btn-lg" onClick={startSim}>
              <FiPlay /> Start Simulation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ───────────────────────────────────────────────────────
  if (phase === 'complete') {
    const passed = terminationReason === 'passed';
    return (
      <div className="sim-page">
        <div className="card sim-result-card">
          <div className={`sim-result-icon ${passed ? 'pass' : 'fail'}`}>
            {passed ? <FiCheckCircle /> : <FiAlertTriangle />}
          </div>
          <h2>{passed ? 'Simulation Passed!' : 'Simulation Failed'}</h2>
          <p className="sim-result-sub">
            {passed
              ? `You correctly identified ${correctFlags} out of ${TOTAL_PHISHING} phishing emails.`
              : `You accumulated ${falsePositives} false positives, exceeding the limit of ${FAIL_THRESHOLD - 1}.`}
          </p>
          <div className="sim-score-grid">
            <div className="sim-score-item correct">
              <span>{correctFlags}</span>
              <label>Phishing Caught</label>
            </div>
            <div className="sim-score-item missed">
              <span>{missed}</span>
              <label>Phishing Missed</label>
            </div>
            <div className="sim-score-item false">
              <span>{falsePositives}</span>
              <label>False Positives</label>
            </div>
          </div>

          <h3 className="sim-results-heading">Full Inbox Review</h3>
          {emails.map(e => {
            const wasFlagged = flagged[e.id];
            const isFalsePos = !e.isPhishing && wasFlagged;
            let statusLabel = '';
            if (e.isPhishing && wasFlagged) statusLabel = '🎣 PHISHING — CORRECTLY FLAGGED';
            else if (e.isPhishing && !wasFlagged) statusLabel = '❌ PHISHING — MISSED';
            else if (isFalsePos) statusLabel = '⚠️ LEGITIMATE — INCORRECTLY FLAGGED';
            else statusLabel = '✅ LEGITIMATE';

            return (
              <div key={e.id} className={`result-email-row ${e.isPhishing ? 'was-phishing' : 'was-legit'} ${isFalsePos ? 'false-positive' : ''}`}>
                <div className="result-email-info">
                  <span className="result-label">{statusLabel}</span>
                  <strong>{e.subject}</strong>
                  <span className="result-from">{e.from}</span>
                </div>
                {e.isPhishing && e.redFlags && (
                  <div className="result-flags">
                    <strong>Red Flags:</strong>
                    <ul>{e.redFlags.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                )}
                <p className="result-explanation">{e.explanation}</p>
              </div>
            );
          })}

          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={startSim}>
            Restart Simulation
          </button>
        </div>
      </div>
    );
  }

  // ── Active simulation ────────────────────────────────────────────────────
  return (
    <div className="sim-page">
      {notification && (
        <div className={`sim-notification sim-notification--${notification.type}`}>
          {notification.msg}
        </div>
      )}

      <div className="sim-header">
        <div>
          <h1>Phishing Simulation Inbox</h1>
          <p>Click 🪝 on any email you identify as phishing. The simulation ends automatically.</p>
        </div>
        <div className="sim-status-bar">
          <div className="sim-status-group">
            <span className="sim-status-label">Phishing Flagged</span>
            <span className="sim-status-value correct-val">{correctFlags} / {PASS_THRESHOLD}</span>
          </div>
          <div className="sim-status-sep" />
          <div className="sim-status-group">
            <span className="sim-status-label">False Positives</span>
            <span className={`sim-status-value ${falsePositives > 0 ? 'warn-val' : ''}`}>{falsePositives} / {FAIL_THRESHOLD}</span>
          </div>
        </div>
      </div>

      <div className="sim-layout">
        {/* Email list */}
        <div className="sim-email-list">
          {emails.map(e => (
            <div
              key={e.id}
              className={`sim-email-item ${selectedEmail?.id === e.id ? 'selected' : ''} ${flagged[e.id] ? 'flagged' : ''}`}
              onClick={() => setSelectedEmail(e)}
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
              {flagged[e.id] && <span className="sim-flagged-icon">🪝</span>}
            </div>
          ))}
        </div>

        {/* Email detail */}
        <div className="sim-email-detail">
          {selectedEmail ? (
            <div className="card sim-email-content">
              <div className="sim-email-content-header">
                <div>
                  <h3>{selectedEmail.subject}</h3>
                  <p className="sim-content-from"><FiMail size={13} /> {selectedEmail.from}</p>
                </div>
                <div className="sim-email-actions">
                  {flagged[selectedEmail.id] ? (
                    <button className="btn btn-danger hook-btn" disabled>
                      🪝 Flagged as Phishing
                    </button>
                  ) : (
                    <button className="btn btn-outline hook-btn" onClick={() => flagEmail(selectedEmail)}>
                      🪝 Hook as Phishing
                    </button>
                  )}
                </div>
              </div>
              <div className="sim-email-body">
                {selectedEmail.body.split('\n').map((line, i) => (
                  <p key={i}>{line || <br />}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="sim-email-placeholder">
              <FiMail size={48} />
              <p>Select an email from the inbox to review it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
