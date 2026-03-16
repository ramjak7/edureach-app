# EduReach India — User Journey Maps
### Companion Artefact to PRD v6.0
**Version:** 2.0 | **Date:** March 2026 | **Status:** CONFIDENTIAL  
**Audience:** UX Design, Product, Engineering, Customer Success  
**Purpose:** End-to-end experience flows for three primary personas. These maps show *how it feels* to use EduReach at each step — the emotional state, friction points, platform response, and the specific moment each persona converts from sceptic to believer. v2.0 adds failure/churn flows at each high-risk stage for all three journeys, and adds tutor failure branches within the existing Tutor Journey.

**v2.0 Changes from v1.0:** Added failure flow branches (student diagnostic drop-off, parent subscription refusal, bad session → churn, tutor demo failure, tutor Academy failure). Tutor journey was already complete in v1.0 — reviewer claim of missing tutor journey was incorrect; v2.0 adds failure branches only.

---

## How to Read These Maps

Each journey map has five layers:

| Layer | What It Shows |
|---|---|
| **Stage** | Named phase of the journey |
| **Actions** | What the user actually does |
| **Touchpoints** | Which platform surfaces are involved |
| **Emotional State** | How the user feels at this moment |
| **Platform Response** | What EduReach does at this moment |
| **Friction / Risk** | Where drop-off or churn is most likely |
| **Success Signal** | The observable behaviour that confirms the step worked |

---
---

# JOURNEY MAP 1 — STUDENT
## Aryan Sharma, Class 10 CBSE, Faridabad
**Goal:** Improve Mathematics and Science before board exams in March  
**Entry point:** Sees EduReach AskAI solution screenshot on his Class 10 WhatsApp group  
**End state:** Active paid subscriber (Core → Plus), using platform daily

---

## Stage 1 — Discovery

> *It's 10:47 PM on a Tuesday. Aryan is stuck on a quadratic equations problem. A classmate posts a screenshot of an AskAI step-by-step solution in the class WhatsApp group. Aryan has never heard of EduReach.*

**Actions**
- Sees AskAI solution screenshot in WhatsApp group
- Notices watermark "Solved by EduReach AskAI"
- Taps the link in the screenshot; lands on EduReach mobile web
- Reads the solution for his classmate's problem
- Tries to type his own question → hits free-tier gate (5 doubts/week)

**Touchpoints**
- WhatsApp (organic referral)
- EduReach mobile web landing page
- AskAI doubt page (free access)
- Free-tier gate message

**Emotional State**
😐 Curious but neutral — has no prior brand relationship. Slightly sceptical (another edtech app?). Becomes genuinely interested when the solution explains *why* each step is taken in board-exam language, not just what the answer is.

**Platform Response**
- AskAI solution is freely viewable without login for the referred link
- After Aryan's own query: "You've used 1 of 5 free doubts this week — create a free account to continue"
- Account creation prompt is lightweight: phone number + OTP only (no email required, no board/class selection yet)

**Friction / Risk**
- If the classmate's solution was wrong or generic → Aryan leaves immediately
- If sign-up requires more than 30 seconds → drop-off
- If AskAI answer is not board-aligned (e.g., uses JEE-level methods for a Class 10 question) → trust broken

**Success Signal**
✅ Aryan creates a free account and submits his own question

---

## Stage 2 — Onboarding

> *Aryan has a free account. It's now the next day. He opens the app properly for the first time.*

**Actions**
- Opens EduReach app (downloaded after last night's AskAI use)
- Selects: CBSE, Class 10, subjects (Mathematics + Science)
- Sets board exam goal: "Target 85%"
- Completes a 20-question adaptive diagnostic in Mathematics (takes ~12 minutes)
- Sees his diagnostic result: a chapter-by-chapter mastery heatmap
- Is prompted to link a parent account → enters mother's phone number
- Mother receives OTP, creates parent account, provides consent

**Touchpoints**
- Student App: onboarding wizard
- Diagnostic assessment engine
- Mastery heatmap (first look)
- Parent account linking flow

**Emotional State**
😯 Mildly surprised the diagnostic is actually hard (not just easy questions to flatter him). Feels a mix of mild anxiety and curiosity seeing the heatmap — Trigonometry is red, Quadratic Equations is amber. "I knew those were weak." Slightly resistant to the parent linking step but completes it when told "Your parent can see your progress — you can turn off specific alerts."

**Platform Response**
- Diagnostic is board-authentic difficulty (not generic); feedback after each question explains the error type (Conceptual / Procedural / Careless)
- Mastery heatmap is shown in plain colour: green (Mastered), yellow (Practicing), red (Needs Attention), grey (Not Started) — no jargon
- Post-diagnostic: "Based on your results, here's your personalised study plan for the next 4 weeks" — specific chapter order, daily time target
- Parent consent flow is smooth: one OTP, no lengthy form

**Friction / Risk**
- Diagnostic drop-off: if it feels like a test that will be judged, not a tool for help → resistance
- Parent linking resistance: Aryan may not want his mother to see everything
- If the study plan looks generic (same for everyone) → immediate disengagement

**Success Signal**
✅ Aryan completes the diagnostic AND reviews his personalised study plan AND at least opens one recommended chapter

### Stage 2 — Failure Flow: Diagnostic Drop-Off

> *Aryan opens the app, starts the diagnostic, answers 8 questions, and closes the app. He never returns.*

**Why this happens:** The diagnostic feels like a test, not a tool. The questions are hard. There is no payoff after each question — only "Next question." The heatmap reveal is gated behind 20 full questions. Aryan loses patience before the value is visible.

**Platform recovery actions (triggered at 24-hour inactivity after incomplete diagnostic):**
- Push notification: "You've started your study plan setup. Pick up where you left off — 8 questions done, 12 to go."
- If no response in 48 hours: WhatsApp message with a different framing: "Skip the diagnostic for now — here are your top 3 doubts to solve first." (AskAI entry instead)
- If no response in 7 days: account is soft-dormant; no further notifications for 14 days; then a "board exam is approaching" contextual re-engagement message

**Recovery target:** > 30% of Stage 2 drop-offs return and complete the diagnostic within 7 days.

**Root cause signal:** If diagnostic drop-off > 40% → UX review of question pacing; consider showing heatmap preview after question 10, not question 20.

---

## Stage 3 — First Week (The Habit Formation Window)

> *Days 2–7. This is the most critical week — 65% of long-term retention is determined by whether the student builds any habit in the first 7 days.*

**Actions**
- **Day 2:** Uses AskAI twice for homework doubts; watches one concept video (Quadratic Equations, Chapter 4) — 11 min
- **Day 3:** Completes 15 practice questions; two are wrong; sees error classification ("Conceptual — you understand the procedure but are misapplying the discriminant formula"); gets a corrective micro-explanation
- **Day 4:** Hits 5-doubt free-tier limit; sees upgrade prompt
- **Day 5:** Considers upgrade; opens Core plan page; sees INR 349/month; asks mother
- **Day 6:** Mother reviews the parent dashboard; sees the mastery heatmap and the weekly report in plain language; notices Trigonometry improvement from 22 to 31 over 4 days; decides to pay
- **Day 7:** Mother purchases Core plan (INR 349/month); Aryan gets unlimited AskAI access

**Touchpoints**
- AskAI (primary daily driver)
- Practice engine (error classification)
- Free-tier gate (upgrade trigger)
- Parent App (mother's first look at dashboard)
- Parent Weekly Report (first report generated at Day 7)
- Subscription purchase flow

**Emotional State**

*Aryan:* 😊 Growing confidence — the error classification tells him exactly why he's wrong, not just that he's wrong. Frustration when hitting the AskAI limit at exactly the moment he needs it (10 PM before a test). Relief when upgrade is approved.

*Mother (Sunita):* 😐→😊 Sceptical at first ("another app Aryan wants us to pay for"). Shift happens when she reads the parent dashboard in plain language — "Aryan needs focused attention on Trigonometry" and "Expected board score: 58–66" alongside "Progress this week: +9 points on Quadratic Equations." This is language she understands and believes.

**Platform Response**
- Error classification is specific and instructive — not "Wrong. Try again." but "Conceptual error: you applied the formula correctly but forgot that the discriminant must be non-negative for real roots."
- AskAI gate message: "You've reached your 5 doubts for this week. Your exam is coming up — don't let a doubt wait. Upgrade to Core for INR 349/month."
- Parent dashboard at Day 7 shows: one full week of data (study time, sessions, mastery trend); written in plain sentences, not charts
- Purchase flow: simple; Razorpay UPI/card/net banking; no dark patterns; auto-renewal disclosed clearly

**Friction / Risk**
- If error classification is generic rather than concept-specific → Aryan stops trusting it
- Mother says no to upgrade → Aryan loses access at highest-urgency moment
- Parent report is confusing or uses too much jargon → mother doesn't see value

**Success Signal**
✅ Core subscription purchased by Day 7 (mother as decision-maker, Aryan as influencer)

### Stage 3 — Failure Flow: Parent Refuses Subscription

> *Aryan asks his mother. She says no. "You already have a tutor. Another app is not necessary."*

**Why this happens:** Sunita has not yet seen the Parent App. She is making a decision about a product she has never used, based only on Aryan's description. Her prior experience with BYJU'S (expensive, unused after 6 weeks) is the dominant frame.

**Trigger:** Aryan hits AskAI limit → attempts upgrade → Sunita sees notification → declines.

**Platform response sequence:**
1. The upgrade attempt triggers a parent notification: "Aryan tried to access more AskAI doubts. Here is a preview of his progress this week." — this brings Sunita into the app for the first time without any sales framing
2. The parent dashboard shows 7 days of data (study time, mastery movement) — evidence before ask
3. Three days after the declined upgrade: Aryan receives in-app message: "Your free AskAI limit resets Monday. Explore other study tools in the meantime — here are your 5 weakest practice areas."
4. If Sunita has opened the Parent App but not subscribed within 14 days: she receives one outreach WhatsApp: "Aryan has been studying 7+ hours this week on EduReach. Here is his progress — and here is what the Core plan adds." (plain-language comparison, no dark patterns)
5. If no subscription after 21 days: Aryan stays on free tier indefinitely; no aggressive retargeting

**Recovery target:** > 25% of parental refusals convert within 30 days after parent engages with dashboard.

**Signal for product:** If parent refusal rate > 60% → investigate whether Parent App first-open experience is sufficiently compelling before the upgrade request appears.

---

## Stage 4 — Tutor Discovery

> *Week 2. Aryan is using AskAI daily. His Trigonometry mastery is stuck at 34 — not improving with just videos and practice. The platform suggests a tutor session.*

**Actions**
- Receives in-app nudge: "Trigonometry has been at 34/100 for 6 days. A 60-minute session with a tutor could unlock this for you — here are 3 matches."
- Opens tutor discovery for the first time
- Views 3 tutor profiles (TPS scores: 82, 76, 71; rates: INR 450, 380, 320/hr)
- Watches 2-minute intro videos for first two tutors
- Compares: top tutor has 47 reviews mentioning "explains step-by-step in CBSE way"
- Books a free 20-minute demo class with top tutor (Rahul — MSc Maths, Lucknow)
- Demo class happens next day (7 PM)

**Touchpoints**
- In-app nudge (mastery stall trigger)
- Tutor discovery page
- Tutor profile cards (TPS, reviews, intro video)
- Demo class booking flow
- Virtual classroom (first time)

**Emotional State**
😐 Slightly resistant to the idea of a tutor ("Isn't that what AskAI is for?"). Changes when he sees Rahul's intro video — Rahul speaks directly to camera: "I specifically teach CBSE Class 9–10 Maths. In my sessions, we work on the exact type of questions that appear in board papers." That specificity is credible.

**Platform Response**
- Mastery stall nudge is contextual and non-intrusive: notification only, not a full-screen modal
- Top 3 matches are pre-filtered by Aryan's board/class/subject and his stated schedule preference (evenings)
- Tutor profile prominently shows TPS, not just average rating; "Gold Tutor" badge is visually prominent
- Demo class is free, no credit card required, no commitment — reduces friction to trying

**Friction / Risk**
- If top tutor's intro video is low quality or feels scripted → breaks trust before the session
- If demo class scheduling requires too many steps → drop-off
- If Rahul doesn't review Aryan's pre-session student card and teaches generically → no second booking

**Success Signal**
✅ Aryan attends demo class AND books a follow-up paid session within 24 hours of demo

---

## Stage 5 — First Paid Session & Conversion to Plus

> *Aryan has his first paid session. This is the highest-stakes moment in the student journey — it determines whether the marketplace works at all.*

**Actions**
- Receives pre-session reminder 30 minutes before (push notification + WhatsApp)
- Opens virtual classroom; Rahul is already there
- Session: Rahul has reviewed Aryan's student card (mastery map + error history + doubt history)
- Rahul opens with: "I can see you're getting the formula right but misapplying it when the coefficient of x² is negative. Let's fix that first."
- 60 minutes: focused on Aryan's specific error pattern, not generic Trigonometry teaching
- Post-session: Rahul sends notes + 5 practice questions
- Aryan rates session 5/5; leaves a written review
- Platform: Aryan's Trigonometry mastery jumps from 34 to 52 within 3 days of session
- Mother receives post-session summary in Parent App; sees mastery improvement; approves recurring weekly session
- Aryan upgrades to Plus (INR 899/month) to get recurring sessions included

**Touchpoints**
- Session reminder (push + WhatsApp)
- Virtual classroom
- Pre-session student card (tutor side)
- Post-session: notes, homework, rating prompt
- Parent App: session summary + safety report
- Upgrade prompt (personalised: "Your Trigonometry jumped 18 points after one session")

**Emotional State**

*Aryan:* 😊→😄 The session feels different from any tutoring he's had. Rahul clearly looked at his data before the session. "He knew exactly where I was stuck before I even said anything." This is the "aha" moment — the platform's learning science becomes tangible.

*Mother:* 😊→😍 Post-session report arrives in her app. She sees: "Session completed. Duration: 62 minutes. Tutor: Rahul Sharma (Gold). Mastery improvement in Trigonometry: +18 points over 3 days. Next session recommended: same time next week." This is the exact information she needed. She approves the weekly recurring booking without hesitation.

**Platform Response**
- Tutor's pre-session student card is auto-generated: shows Aryan's last 14 days of mastery changes, error type distribution, and AskAI doubt history — Rahul uses this to personalise from minute one
- Post-session parent summary is auto-generated within 2 hours: plain language, mastery delta, session recording available
- Upgrade prompt arrives 3 days post-session when mastery improvement is visible: "Since your session with Rahul, your Trigonometry score has improved 18 points. Book weekly sessions with Rahul for INR 899/month (2 sessions included)."

**Friction / Risk**
- If Rahul ignores the student card and teaches generically → "aha" moment doesn't happen; no repeat booking
- Technical issues in classroom → destroys trust at highest-stakes moment
- Post-session mastery improvement is slow to reflect → parent doesn't see evidence; doesn't approve recurring booking

**Success Signal**
✅ Aryan upgrades to Plus AND books a recurring weekly session with Rahul

### Stage 5 — Failure Flow: Bad Session → Booking Stops

> *Aryan's first paid session goes badly. The tutor didn't look at the student card. Taught generic Trigonometry theory. The mastery score doesn't move. Aryan doesn't book again.*

**Why this happens:** Tutor ignored the pre-session student card, taught from their own lesson plan, never addressed Aryan's specific discriminant error pattern. The session felt like a generic coaching class, not personalised help. EduReach's core value proposition failed in delivery.

**Detection signals (automated, within 48 hours of session):**
- Session rating ≤ 2/5 filed by student
- OR no rating filed AND no follow-up booking within 5 days of first paid session (churn indicator)
- OR mastery score for session subject fails to improve within 72 hours post-session

**Platform response sequence:**
1. If rating ≤ 2/5: Student Success Manager contacts Aryan personally within 24 hours: "We saw your rating. Can you tell us what happened? We want to make it right."
2. Offer: free replacement session with a different tutor, manually matched (not algorithmic) by Student Success
3. TPS consequence to original tutor: rating recorded; retention score decremented; if this is their 3rd ≤ 2/5 rating in 30 days → performance review triggered
4. If no re-booking after 7 days despite outreach: subscription remains active; student is flagged as at-risk in Student Learning Health Dashboard
5. If no session booking and engagement drops for 14 days: Student Success escalates to offering a free single session credit ("Come back — we want to get this right")

**Recovery target:** > 50% of students who receive a bad-session recovery offer book a replacement session.

**Root cause address:** Bad session failure is a tutor quality failure, not a product failure. The anti-gaming and TPS systems are the long-term fix. Student recovery is the short-term response.

---

## Stage 6 — Ongoing Engagement (The Retention Loop)

> *Weeks 3–12. Aryan is now a Plus subscriber with a weekly tutor session. The question is whether the platform becomes part of his study identity or fades into background.*

**Actions**
- Daily: AskAI for homework doubts (avg 5–7/day as exams approach)
- 3× per week: practice sessions (adaptive difficulty; chapters recommended by spaced repetition engine)
- Weekly: 60-min session with Rahul
- Monthly: receives Exam Readiness Score update ("Expected Math board score: 71–79")
- 8 weeks before boards: activates Exam Intensive Mode (30-day countdown, daily revision plan)
- Shares AskAI solutions on WhatsApp group (3 classmates sign up; referral bonus credited)
- Parents see monthly comparison: "School mid-term score: 72. Platform predicted: 68–76. Good alignment."

**Touchpoints**
- AskAI (daily)
- Practice engine + spaced repetition prompts
- Weekly session + pre-session student card + post-session notes
- Exam countdown widget
- Monthly Exam Readiness Score
- Referral sharing (AskAI watermarked screenshots)
- Parent monthly report

**Emotional State**
😊→😎 Aryan stops thinking of EduReach as "an app" and starts thinking of it as "where I study." The spaced repetition prompts ("Time to revisit Chapter 6 — you haven't practiced it in 18 days and the board exam is in 11 weeks") feel like a coach who is watching out for him. Confidence score rising. "I actually know what I know and what I don't."

**Platform Response**
- Spaced repetition nudges are specific: chapter name, days since last review, days to exam — not generic "Time to revise!"
- Exam Readiness Score is shown as a range ("71–79 marks") not a single number — honest, not falsely precise
- Exam Intensive Mode auto-builds a daily plan: which chapters to revise, in what order, based on current mastery and board exam chapter weights
- Referral flow is one tap: "Share this solution" → watermarked image generated → credits applied automatically when classmate signs up

**Friction / Risk**
- If Rahul becomes unavailable (illness, cancels) and replacement tutor is worse → trust break
- If Exam Readiness Score doesn't move despite effort → demotivating
- Spaced repetition prompts feel overwhelming in last 2 weeks before exam → burnout signal detection must work

**Success Signal**
✅ Aryan uses platform on ≥ 5 days/week for 8+ consecutive weeks; boards exam score within predicted range

---

## Student Journey — Emotional Arc

```
Stage 1: Discovery       [Neutral / Curious]
          ↓
Stage 2: Onboarding      [Mildly anxious / Engaged]
          ↓
Stage 3: First Week      [Building trust / Frustrated at limit]  ← CONVERSION POINT 1 (Free → Core)
          ↓
Stage 4: Tutor Discovery [Sceptical → Intrigued]
          ↓
Stage 5: First Session   [BREAKTHROUGH — "This is different"]   ← CONVERSION POINT 2 (Core → Plus)
          ↓
Stage 6: Ongoing         [Confident / Reliant]                  ← RETENTION LOOP
```

---
---

# JOURNEY MAP 2 — TUTOR
## Rahul Sharma, MSc Mathematics, Lucknow
**Goal:** Build a sustainable income teaching CBSE/ICSE Math online; escape bad leads and late payments from UrbanPro  
**Entry point:** Sees a Facebook ad: "Tired of bad leads? Teach quality students on EduReach."  
**End state:** Active Gold-tier tutor, earning INR 45,000+/month, 12+ students, fully activated

---

## Stage 1 — Discovery & Initial Motivation

> *Rahul has been on UrbanPro for 2 years. He gets 3–4 leads/month; 1–2 convert. Payment is always awkward — cash or UPI, sometimes delayed. He has no tools, no profile visibility, no brand. The Facebook ad hits him on a Tuesday evening.*

**Actions**
- Sees EduReach tutor acquisition Facebook ad
- Taps through to tutor landing page
- Reads: earnings calculator (inputs: Math, CBSE, 15 sessions/week → "Estimated earnings: INR 42,000–54,000/month")
- Reads: "Quality verified students. Automated payments every Monday. Tools included."
- Reads tutor testimonial: "I moved from UrbanPro 6 months ago. I earn 3x more and never chase payments."
- Taps "Apply to Teach"

**Touchpoints**
- Facebook ad (tutor acquisition channel — UrbanPro migration targeting)
- Tutor landing page
- Earnings calculator
- Tutor testimonial carousel
- Application CTA

**Emotional State**
😤→😊 Frustrated with his current situation. The earnings calculator is the hook — not because it promises riches, but because it shows a plausible, specific number derived from his stated inputs. The testimonial from another UrbanPro tutor is credible because it names the specific pain point (chasing payments).

**Platform Response**
- Landing page leads with the tutor's pain, not EduReach's features: "Stop chasing leads. Stop chasing payments."
- Earnings calculator is interactive and uses real commission rates (not inflated; honest)
- Application form appears immediately after CTA — no "we'll contact you" delay

**Friction / Risk**
- If earnings calculator shows unrealistic numbers → distrust from the start
- If application form is long (> 5 minutes) → drop-off at first step

**Success Signal**
✅ Rahul submits the application form

---

## Stage 2 — Application & Verification

> *Rahul submits the form. He's been through UrbanPro's process — it was just creating a profile. EduReach is more rigorous, which he finds reassuring and slightly intimidating.*

**Actions**
- Completes application form: name, subject, boards taught, classes, city, years of experience
- Uploads: MSc degree certificate, ID proof (Aadhaar), 2 years of experience reference
- Receives automated email: "Application received. Document verification: 24–48 hours."
- Next day: receives confirmation — "Documents verified. Your subject knowledge test is ready."
- Takes 45-minute Mathematics test (CBSE Class 9–12 difficulty)
- Receives result immediately: 84% — "Pass. Proceed to demo class submission."

**Touchpoints**
- Application form
- Document upload interface
- Automated verification email (IDfy integration)
- Subject knowledge test (platform-administered)
- Instant result notification

**Emotional State**
😬→😌 Slightly nervous about the subject test ("What if I fail? That would be embarrassing"). Reassured by the immediate result and the 84% score. "At least they actually check. The students on this platform probably know what they're doing too."

**Platform Response**
- Document verification automated via IDfy API — Rahul does not wait for a human to manually check
- Subject test is delivered in platform UI — no third-party tool; test design is board-authentic (same type of questions Rahul would actually teach)
- Instant result removes anxiety about waiting; clear next step provided

**Friction / Risk**
- 48-hour verification window: if stretched to 72+ hours, Rahul's motivation drops
- Subject test difficulty: if too easy → Rahul doesn't respect the standard; if too hard → legitimate tutors rejected

**Success Signal**
✅ Subject test passed; Rahul proceeds to demo class submission

---

## Stage 3 — Demo Class & QA Evaluation

> *Rahul records his demo class. He's taught live for 7 years but has never recorded a lesson or been formally evaluated. This is the most stressful step.*

**Actions**
- Reads demo class guidelines (what the rubric measures — 5 criteria shown openly)
- Books a 20-minute demo slot on the EduReach virtual classroom
- Records a lesson on CBSE Class 10 Quadratic Equations (his strongest topic)
- Deliberately opens with a problem: "A ball is thrown upward. When does it hit the ground?" — works through the algebra, connects it to Quadratic Equations
- Submits the recording
- Waits 36 hours
- Receives evaluation: 22/25 — Pass. Feedback: "Strong Problem-First opening and clear board alignment. Whiteboard usage could be more structured — consider pre-drawing your axes before starting."
- Proceeds to Tutor Academy

**Touchpoints**
- Demo class guidelines and rubric (transparent, pre-shared)
- EduReach virtual classroom (first experience)
- Demo submission confirmation
- Evaluation result + written feedback

**Emotional State**
😰→😄 Anxious while recording — self-conscious about being evaluated. Relieved at 22/25. The written feedback ("strong Problem-First opening") is specifically satisfying — it names *what he did right*, not just the score. The whiteboard note is actionable, not vague. "They actually watched it."

**Platform Response**
- Rubric is shared with Rahul *before* recording — no hidden criteria. He knows exactly what to demonstrate.
- QA reviewer watches the full demo and writes specific feedback — not a checkbox score
- 48-hour SLA is met (36 hours actual) — response time builds trust in the platform's operational quality

**Friction / Risk**
- If QA feedback is generic ("Good lesson, keep it up") → Rahul doesn't trust the evaluation process
- If rubric isn't shared beforehand → feels arbitrary and discouraging

**Success Signal**
✅ Demo class approved; Rahul receives written feedback and proceeds to Academy

### Stage 3 — Failure Flow: Demo Class Rejected

> *Rahul submits his demo class. Score: 12/25. Rejected. Feedback: "Opening was definition-first, not problem-first. Pacing too fast for stated class level. No examiner-perspective annotations."*

**Why this happens:** Rahul has taught for 7 years in a coaching institute where rote and definition-first teaching is the norm. He doesn't know EduReach's specific pedagogy standard. The rubric was shared, but reading it and internalising it are different.

**Platform response:**
1. Rejection email within 48 hours: specific per-criterion feedback (not "you failed" — "criterion 1: 2/5 because you opened with the definition of discriminant rather than a word problem involving projectile motion")
2. Rahul offered: one free resubmission window (10 days) + access to two sample "gold standard" demo recordings from anonymised approved tutors
3. If resubmission passes: proceeds to Academy; no additional penalty
4. If resubmission also fails: permanently rejected from platform for 6 months; may reapply with documented evidence of pedagogy training
5. Note in feedback: "65% of tutors who fail the first demo and use our sample recordings pass on resubmission. These recordings show exactly what we're looking for."

**Recovery target:** > 55% of first-attempt failures pass resubmission after seeing sample recordings.

**Signal for operations:** If demo pass rate (first attempt) drops below 50% → sample recordings and rubric guidance need update; likely a communication problem not a candidate quality problem.

---

## Stage 4 — Tutor Academy

> *Rahul completes the 5-module Academy. He expected it to be generic corporate training. It isn't.*

**Actions**
- Module 1 (45 min): EduReach Pedagogy Framework — Problem-First methodology; works through 3 sample lesson openings; takes 15-question quiz → 93% (first attempt)
- Module 2 (30 min): Student Intelligence Card — sees a sample student card for the first time; shocked at the depth of data ("I would have killed for this about my students"); writes a practice session plan; gets feedback from QA on the plan
- Module 3 (45 min): Board Exam Strategy — CBSE marking scheme nuances he didn't know (e.g., method marks awarded even when final answer is wrong, if working is shown)
- Module 4 (30 min): Platform Tools — virtual classroom walkthrough; post-session workflow; earnings dashboard tutorial
- Module 5 (30 min): Child Safety — watches video; reads POCSO awareness content; signs Child Safety Policy digitally
- Total: 3 hours over 2 days

**Touchpoints**
- Tutor Academy LMS (all 5 modules)
- Practice session plan submission (Module 2)
- QA feedback on session plan
- Digital policy sign-off

**Emotional State**
😑→😮→😊 Enters Academy expecting box-ticking. Module 2 (Student Intelligence Card) is the genuine surprise — Rahul has never had pre-session data on a student's specific concept-level gaps before. "If I'd had this when I was teaching at the coaching institute, my results would have been so much better." Module 3 has 2–3 marking scheme facts he genuinely didn't know. Academy becomes credible.

**Platform Response**
- Academy is not passive video — it includes exercises (write a session plan; take a quiz; identify error types in a sample student's practice history)
- Module 2's practice session plan gets real feedback, not automated scoring only — a QA reviewer reads it and responds within 24 hours
- Digital policy sign-off is given context — Rahul is told why POCSO matters in online tutoring; not just asked to click "I agree"

**Friction / Risk**
- If Academy feels like a compliance checkbox (low-quality content) → Rahul loses respect for the platform's standards
- Module 2 must demonstrate the Student Intelligence Card with genuinely impressive data — if sample is thin, the "aha" moment doesn't land

**Success Signal**
✅ All 5 modules completed with pass marks; Child Safety Policy signed; profile published within 14 days of Academy access

### Stage 4 — Failure Flow: Academy Not Completed Within 14 Days

> *Rahul gets demo class approval on a Thursday. Opens Module 1 the same evening, completes it. Then life gets busy — he has offline students to manage, a family event. Day 14: only 2 modules complete. He receives an extension notice.*

**Why this happens:** The Academy requires ~3 hours across 5 modules. For working tutors, 14 days is enough for the motivated; it is tight for the genuinely busy. Abandonment usually happens between Module 2 and 3, not at Module 1 (motivation is high at start).

**Platform response timeline:**
- Day 7: if fewer than 3 modules complete → automated WhatsApp reminder: "You're halfway through the Tutor Academy — just 2–3 modules left. Your first students are waiting."
- Day 12: if not all modules complete → personal message from Tutor Success Manager: "Hi Rahul — I noticed you've almost finished the Academy. Module 3 takes 45 minutes. Is there anything blocking you? I can help."
- Day 14: if incomplete → one 7-day extension granted automatically; tutor notified
- Day 21: if still incomplete → application rejected; Rahul may reapply after 30 days; no penalty beyond delay; all onboarding data retained

**Recovery target:** > 85% of tutors who receive the Day 12 personal outreach complete Academy within the extension period.

**Signal for operations:** If Academy completion rate drops below 75% → review module length; Module 3 (45-min board exam) is the most likely bottleneck based on content complexity.

---

## Stage 5 — Profile Live & First Student Match

> *Rahul's profile is published. He appears in search results. He's been active for 4 days with zero bookings. Then the Student Success Manager contacts him.*

**Actions**
- Profile goes live; receives "You're live!" email with link to his own profile
- Reviews his profile — adjusts his intro video (re-records with better lighting)
- Day 4: no bookings yet; starts to wonder
- Day 18: Student Success Manager calls: "We've identified a student for you — Aryan, Class 10 CBSE Math, exactly your profile. He's looking for a demo class. Interested?"
- Rahul says yes; accepts the facilitated match
- Reviews Aryan's Student Intelligence Card before the demo: immediately notices the discriminant error pattern in Quadratic Equations
- Demo class: 20 minutes; Rahul opens with the discriminant problem; Aryan is visibly engaged
- Aryan books a paid session within 24 hours

**Touchpoints**
- Profile live notification
- Tutor profile page (public-facing)
- Student Success Manager outreach (call/WhatsApp)
- Pre-demo Student Intelligence Card (first real use)
- Virtual classroom (demo)
- Booking confirmation notification

**Emotional State**
😐→😬→😊 Slight anxiety during the first 18 days of silence ("Did I do something wrong?"). Relief when Student Success Manager calls — "They actually noticed and reached out." The pre-demo student card is the second major "aha" moment: Rahul sees Aryan's specific error pattern before the session starts. The demo goes well because Rahul was prepared. "This is completely different from UrbanPro."

**Platform Response**
- Student Success Manager uses the Student Learning Health Dashboard at-risk flags to identify students who have stalled on a concept and would benefit from tutor introduction
- Student Intelligence Card is auto-generated for Rahul before the demo — no extra work required from either side
- First match guarantee operationalised: Student Success team facilitates within 21 days of profile going live

**Friction / Risk**
- 18 days of silence without Student Success outreach → Rahul stops checking the app; misses the facilitated match
- If facilitated match is a poor fit (wrong subject, wrong schedule) → frustration
- Demo class technical issues (first time on platform) → destroys confidence in the tool

**Success Signal**
✅ Rahul completes his first paid session and receives his first TPS data point

---

## Stage 6 — Growing the Practice

> *Month 2–6. Rahul has 4 regular students. He's earning INR 22,000/month. He wants to reach INR 45,000.*

**Actions**
- Receives weekly TPS dashboard email: current score 76 (Gold tier); breakdown shows Student Retention Rate is his lowest component (70%) — one student didn't rebook after 3 sessions
- Reviews that student's session notes; sees he stopped sending homework after session 2
- Starts sending post-session homework consistently; retention improves
- Completes optional Pedagogy Webinar: "Teaching Error Pattern Recognition" — earns a badge displayed on his profile
- Profile click-through rate improves: webinar badge and more student reviews driving more demo bookings
- Month 4: 9 regular students; INR 38,000/month
- Refers a colleague from his old coaching institute: INR 1,000 bonus credited
- Month 6: 14 students; INR 52,000/month; TPS 83 (Gold, approaching Platinum)

**Touchpoints**
- Weekly TPS dashboard (email + in-app)
- TPS component breakdown (actionable, specific)
- Optional pedagogy webinars (in-app)
- Tutor profile (public) — badge display
- Tutor referral program
- Earnings dashboard

**Emotional State**
😊→😎 The TPS breakdown is the key — it doesn't just say "your score is 76"; it says "your weakest component is Student Retention (70%). Here's what drives retention: consistency of post-session homework, and session continuity." Rahul finds this data-driven feedback more useful than any management feedback he received at the coaching institute. "I know exactly what to improve and why."

**Platform Response**
- TPS component breakdown is specific and actionable — each component links to a "How to improve this" guide
- Webinar badges are prominently displayed on the public profile — students see them; click-through improves
- Tutor referral programme is visible in the earnings dashboard with real-time status: "You have referred 1 tutor. Status: Onboarding in progress. Bonus: INR 1,000 pending activation."

**Friction / Risk**
- If TPS breakdown is vague ("improve retention") without actionable guidance → Rahul can't act on it
- Platform changes commission structure without notice → breaks trust permanently
- A student files a complaint he considers unfair → dispute process must be transparent and fair

**Success Signal**
✅ Rahul reaches INR 45,000/month by Month 6; TPS remains > 70; refers at least 1 colleague

---

## Tutor Journey — Emotional Arc

```
Stage 1: Discovery          [Frustrated with status quo → Cautiously hopeful]
          ↓
Stage 2: Application        [Slightly nervous → Reassured by rigour]
          ↓
Stage 3: Demo Class         [Anxious → Validated]
          ↓
Stage 4: Tutor Academy      [Sceptical → Genuinely surprised by depth]
          ↓
Stage 5: First Student      [Anxious wait → BREAKTHROUGH moment with Student Card]
          ↓
Stage 6: Growing Practice   [Confident → Self-directed improvement via TPS data]
```

---
---

# JOURNEY MAP 3 — PARENT
## Sunita Mehta, Mother of Aryan (Class 10 CBSE), Pune
**Goal:** Ensure Aryan does well in his Class 10 boards; have real visibility into his preparation; not be misled by another edtech platform  
**Entry point:** Aryan asks her to pay for a Core subscription (INR 349/month)  
**End state:** Active Pro subscriber; monthly parent-tutor review participant; platform advocate in school parent group

> *Note: Sunita's journey overlaps with Aryan's — she is the financial decision-maker and trust anchor. Her journey is about trust, evidence, and control — not features.*

---

## Stage 1 — First Encounter (Scepticism)

> *Aryan shows her the EduReach app on Day 5 and asks her to pay. Sunita has been burned before — BYJU'S, an expensive coaching app that Aryan stopped using after 3 weeks.*

**Actions**
- Aryan shows her the app and explains the AskAI feature
- Sunita asks: "What exactly does it do?"
- Aryan shows her a solved question — step-by-step, with marking scheme annotation
- Sunita asks about price; Aryan says INR 349/month
- Sunita asks: "Is there a free trial? Can I cancel?"
- Sunita downloads the Parent App and sees the consent request

**Touchpoints**
- Aryan's student app (Sunita viewing over his shoulder)
- Parent App install + consent screen
- Subscription pricing page

**Emotional State**
😑 Deeply sceptical. Has paid for edtech before and felt cheated. Her specific fear: "Aryan will use it for a week and lose interest, and we'll have paid for 3 months." Slightly reassured by the INR 349 price (not INR 3,000/month like BYJU'S). The plain-language description of what the app does — "helps Aryan know exactly where he's weak before the board exam" — is relatable.

**Platform Response**
- Parent App onboarding is separate from student onboarding — Sunita goes through her own lightweight flow
- Consent screen explains in plain language (not legalese) what data is collected about Aryan and why
- Subscription page shows: "Cancel anytime. Full refund within 7 days, no questions asked." — prominently, not in fine print
- Pricing comparison is straightforward — no confusing bundles on first view

**Friction / Risk**
- Any dark pattern (auto-renew buried, cancellation hard to find) → immediate distrust
- If Parent App onboarding is complicated → Sunita gives up and Aryan doesn't get the subscription
- Consent language is confusing or alarming → Sunita refuses to allow data collection

**Success Signal**
✅ Sunita completes Parent App onboarding and grants consent; Core subscription purchased

---

## Stage 2 — First Week in Parent Dashboard

> *Sunita pays for Core. She opens the Parent App for the first time 3 days later, expecting to see a confusing dashboard full of charts.*

**Actions**
- Opens Parent App
- Sees a plain-language weekly summary: "Aryan studied 6.5 hours this week (target: 10 hours). He's making good progress in Algebra but needs more work on Trigonometry."
- Taps on Trigonometry: sees a plain-language explanation — "Aryan has been practicing Trigonometry but is making conceptual errors — he understands the formulas but misapplies them. A tutor session may help."
- Sees session attendance log: 0 sessions booked (free tier, no sessions)
- Sees AskAI usage: 18 doubts solved this week
- Sees the platform's Exam Readiness Score: "Expected Math board score: 54–62." Feels concerned — she expected better.

**Touchpoints**
- Parent App home screen
- Weekly learning summary (plain language)
- Subject drill-down (Trigonometry detail)
- Exam Readiness Score display
- Session attendance section (empty)

**Emotional State**
😐→😟 The simplicity of the dashboard is surprising — she expected a confusing wall of charts. But the Exam Readiness Score ("54–62 in Math") is alarming — she didn't know it was this low. Doesn't know if this is accurate or if the platform is manufacturing urgency to sell sessions.

**Platform Response**
- Dashboard home shows the 3 most important things in plain language, not 12 metrics in graphs
- Exam Readiness Score is shown with a confidence range and an explanation: "This estimate is based on Aryan's current mastery of each chapter weighted by how often it appears in board papers."
- Below the score: "How to improve this" — concrete suggestions (not "buy a session"), including free options like "Aryan hasn't watched the Chapter 8 video yet"
- No pushy upsell on first dashboard view

**Friction / Risk**
- Exam Readiness Score feels too low to be credible → Sunita dismisses it as scare tactics
- If the dashboard explanation uses jargon (mastery score, spaced repetition, concept graph) → Sunita disengages
- If "How to improve" immediately leads to a "Book a session" CTA → feels like a sales funnel

**Success Signal**
✅ Sunita checks the Parent App again within 48 hours without being prompted

---

## Stage 3 — Tutor Evaluation (The Trust Decision)

> *Week 2. Sunita sees the in-app recommendation for a tutor session. She needs to approve it — Aryan is under 16, and the platform requires parent approval for tutor assignments.*

**Actions**
- Receives notification: "Platform recommendation: A tutor session may help Aryan improve faster in Trigonometry."
- Opens the recommendation; sees 3 tutor profiles
- Reviews Rahul's profile: TPS 82, Gold badge, "MSc Mathematics, 7 years experience, CBSE specialist"
- Reads 3 parent reviews (not student reviews — Sunita filters by parent reviews specifically)
- Sees: "All sessions are recorded and available to you within 2 hours."
- Sees: "You can review all chat messages between Aryan and this tutor."
- Approves tutor booking; Aryan books the demo class

**Touchpoints**
- Push notification (tutor recommendation)
- Tutor profile (parent view — shows parent-specific reviews, safety features)
- Child safety controls section
- Tutor approval flow

**Emotional State**
😬→😊 The core concern is safety — an adult male stranger will be alone in a video call with her 15-year-old son. The session recording disclosure ("you can watch every session within 2 hours") changes her calculus. The parent review filter — seeing what other *parents* (not students) say — adds a layer of peer validation. She approves, but decides she will watch the first recording.

**Platform Response**
- Tutor profile has a dedicated "For Parents" section — different content from student-facing profile
- Session recording disclosure is on the approval screen itself — not buried in terms and conditions
- Parent reviews are filterable (by parent account type vs. student account type)
- Approval is a single tap — no friction once trust is established

**Friction / Risk**
- Tutor profile has no parent reviews (new tutor) → Sunita may not approve
- Session recording is not clearly disclosed → safety concern not resolved → approval withheld
- Approval process requires too many steps → Aryan misses the booking window

**Success Signal**
✅ Sunita approves the tutor; Aryan books demo class

---

## Stage 4 — Post-Session Trust Anchoring

> *The day after Aryan's first paid session. This is the moment EduReach either earns Sunita's long-term trust or becomes another app she pays for and ignores.*

**Actions**
- Receives push notification: "Aryan's session with Rahul has completed. View summary and recording."
- Opens Parent App
- Reads session summary (auto-generated): "Session Duration: 62 minutes. Focus: Trigonometry — discriminant applications. Post-session homework: 5 practice questions assigned. Safety: No concerns detected. Recording available."
- Taps "View Recording" → watches first 5 minutes
- Sees Rahul using a structured whiteboard approach; hears him say: "Aryan, I looked at your practice history — the issue is specifically when the coefficient is negative. Let's make sure you never get this wrong again."
- Closes recording at 8 minutes (satisfied; doesn't need to watch the whole thing)
- 3 days later: checks mastery score — Trigonometry: 34 → 52
- That evening: proactively approves recurring weekly booking without being prompted

**Touchpoints**
- Post-session push notification
- Session summary (Parent App)
- Session recording player
- Mastery score trend (3 days post-session)
- Recurring booking approval prompt

**Emotional State**
😌→😊→😍 The session summary is the first test: plain language, specific, no jargon. Watching 8 minutes of recording is the second test: Rahul demonstrably used Aryan's data to personalise the session. Seeing the mastery score jump from 34 to 52 over 3 days is the third test — and it's the closing argument. "The platform does what it says it does." Sunita becomes a genuine believer at this moment, not before.

**Platform Response**
- Session summary is auto-generated and delivered within 2 hours — Sunita doesn't have to ask for it
- Safety summary is explicit: "No concerns detected in this session" — Sunita knows the platform is actively watching
- Recording player is simple: tap to play; no login required (she's already in the app); no buffering on a mobile connection
- Mastery score is highlighted with context: "Trigonometry: 34 → 52 (+18) — Aryan's biggest improvement this week"

**Friction / Risk**
- If session summary is delayed (> 4 hours) → Sunita checks, can't find it, feels unmonitored
- If recording takes too long to load (buffering on mobile) → she gives up watching
- If mastery score doesn't improve at all in 3 days → evidence cycle fails

**Success Signal**
✅ Sunita watches part of the recording AND sees mastery improvement AND proactively approves recurring booking

---

## Stage 5 — Long-Term Engagement & Advocacy

> *Month 2–6. Sunita is now a plus subscriber. She has become the platform's most powerful acquisition channel — other parents trust her more than any ad.*

**Actions**
- Receives monthly parent-tutor review meeting prompt; joins a 15-minute video call with Rahul
- Agenda (auto-prepared by platform): 3 focus areas for next month based on Aryan's data
- Sunita asks about upcoming school exams; Rahul flags that Statistics (Chapter 14) needs attention
- Platform sends school exam reminder 5 days before; Aryan practices Statistics that week
- School exam result: 78. Platform had predicted 72–80. Sunita sees alignment message: "Your school exam score matches our prediction — Aryan's preparation is on track."
- Shares the weekly report screenshot in her school parent WhatsApp group: "This platform is actually honest about where Aryan stands."
- 3 parents from the group sign up; Sunita earns INR 300 credit per conversion (INR 900 total)
- Month 6: Sunita upgrades to Pro plan (INR 2,199/month) for dedicated academic advisor access ahead of board exams

**Touchpoints**
- Monthly parent-tutor review meeting (video call)
- School exam prediction vs. result alignment notification
- Parent referral sharing (WhatsApp)
- Referral credit notification
- Pro plan upgrade prompt

**Emotional State**
😊→😍→🗣️ The monthly parent-tutor call is the moment Sunita transitions from passive monitor to active participant. The school exam prediction alignment is the strongest credibility signal — it shows the platform's learning model is calibrated, not inflated. The WhatsApp share is entirely organic: she shares because she genuinely trusts the platform and wants other parents to benefit.

**Platform Response**
- Monthly parent-tutor meeting is structured by the platform — Sunita receives the agenda 24 hours before; she knows what to ask
- School exam prediction vs. result alignment is proactively surfaced: "Your prediction was 72–80. Aryan scored 78. The platform's model was accurate."
- Referral credit is applied automatically — no redemption process required; credited against next renewal
- Pro upgrade prompt arrives when Sunita is most receptive: after the school exam alignment, not at a random time

**Friction / Risk**
- If monthly tutor call happens without a structured agenda → Sunita doesn't know what to say; call feels unproductive
- If school exam result diverges significantly from prediction without explanation → trust break
- Referral sharing is inhibited if sharing the weekly report requires screenshots rather than a one-tap share button

**Success Signal**
✅ Sunita refers ≥ 1 parent AND upgrades to Pro plan before board exam season

---

## Parent Journey — Emotional Arc

```
Stage 1: First Encounter    [Deep scepticism — "Another BYJU'S"]
          ↓
Stage 2: First Dashboard    [Surprised by simplicity / Concerned about scores]
          ↓
Stage 3: Tutor Evaluation   [Anxious about safety → Reassured by recording disclosure]
          ↓
Stage 4: Post-Session       [TRUST ANCHOR — recording + mastery improvement = believer]   ← KEY MOMENT
          ↓
Stage 5: Long-Term          [Active advocate — shares platform in parent groups]
```

---
---

# Cross-Journey Interaction Map

> The three journeys are not independent — they intersect at critical moments that either reinforce or break the overall product experience.

```
STUDENT (Aryan)              PLATFORM                    PARENT (Sunita)
                                                          
Stage 2: Onboarding    ──→  Parent consent request  ──→  Stage 1: First encounter
                                                          
Stage 3, Day 7         ──→  Parent weekly report    ──→  Stage 2: Dashboard review
(hits AskAI limit)     ──→  Upgrade recommendation  ──→  (decides to pay)
                                                          
Stage 4: Tutor         ──→  Approval request        ──→  Stage 3: Tutor evaluation
discovery                   (child < 16)
                                                          
Stage 5: First         ──→  Post-session summary    ──→  Stage 4: Trust anchoring
paid session           ──→  Session recording       ──→  (watches recording)
                       ──→  Mastery improvement
                                                          
TUTOR (Rahul)                                             
                                                          
Stage 5: First match   ──→  Student card generated  ──→  (Aryan's Stage 4 success
(views Aryan's card)        for Rahul                    depends on Rahul using it)
                                                          
Stage 6: TPS data      ──→  Retention component     ──→  (If Rahul improves retention,
                            score improves               Sunita keeps subscribing)
```

---

## Critical Moments Summary

| Journey | Critical Moment | Platform's Job at That Moment | Failure Mode |
|---|---|---|---|
| Student | Day 3: First error classification | Be specific about *why* — not just *that* — the error occurred | Generic feedback → Aryan loses trust in the learning engine |
| Student | Day 7: AskAI limit hit | Surface upgrade at maximum urgency, not maximum manipulation | Too pushy → feels like a trap; too passive → misses conversion |
| Student | First session with Rahul | Rahul must use the student card visibly and specifically | Generic session → no "aha" moment → no Plus upgrade |
| Tutor | Academy Module 2 | Student Intelligence Card must genuinely impress | Thin sample data → Rahul doesn't see the value |
| Tutor | First 18 days (no bookings) | Student Success Manager must reach out before Rahul disengages | Silence → Rahul gives up; 20+ days → too late |
| Parent | Post-session notification (Day after first paid session) | Session summary + recording must arrive within 2 hours, be readable, and show mastery improvement | Delayed or confusing summary → trust not anchored |
| Parent | School exam prediction alignment | Platform must proactively surface the alignment message | Passive display → Sunita never notices; alignment not credible |

---

*EduReach India — User Journey Maps v2.0 | March 2026 | CONFIDENTIAL*  
*Companion to PRD v7.0. Supersedes User Journey Maps v1.0.*  
*Audience: UX Design, Product Management, Engineering, Customer Success, Tutor Operations.*  
*v2.0 changes: Added failure flow branches at high-risk stages (Stage 2 diagnostic drop-off, Stage 3 parent refusal, Stage 5 bad session; Tutor Stage 3 demo rejection, Tutor Stage 4 Academy abandonment). Tutor Journey Map was already complete in v1.0. Cross-Journey Interaction Map unchanged.*  
*Next review: post-Phase 1 launch (Month 7) — update with actual user research data and measured drop-off rates.*
