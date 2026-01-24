# Screen Parity Report: ALEIC ← Reference

This document details all screen alignments made to match the reference implementation (couplestherapy-main) in terms of question wording, presentation patterns, screen flow, and field labels.

---

## A) Love Language Quiz

**Files:**
- Target: `client/screens/couple/LoveLanguageQuizScreen.tsx`
- Reference: `reference/couplestherapy-main/mobile/src/screens/client/LoveLanguageQuizScreen.tsx`

**Status:** Aligned

**Matching Elements:**
- Shows ONE question at a time with 5 answer options (matches reference exactly)
- Progress bar at top of screen
- "Question N of 5" indicator text
- Question wording matches reference exactly:
  1. "I feel most loved when..."
  2. "I appreciate it most when..."
  3. "My ideal date would be..."
  4. "I feel disconnected when..."
  5. "I show love by..."
- All 5 option texts per question match reference exactly
- Auto-advance to next question on option selection
- Results screen structure:
  - "Your Love Language" title
  - Primary Love Language (highlighted)
  - Secondary Love Language
  - Breakdown section with all 5 language scores
  - "Retake Quiz" button
- Intro screen with 5 love languages list and "Start Quiz" button

**Note:** Reference uses 5 options per question (one per love language). This is the standard Love Languages quiz format.

---

## B) Love Map Quiz

**Files:**
- Target: `client/screens/tools/LoveMapQuizScreen.tsx`
- Reference: `reference/couplestherapy-main/mobile/src/screens/client/LoveMapQuizScreen.tsx`
- Constants: `client/constants/loveMapQuestions.ts`

**Status:** Aligned

**Matching Elements:**
- Three-phase flow: Truths → Guesses → Results
- Phase labels match reference:
  - "Phase 1: Your Truths"
  - "Phase 2: Guess Your Partner"
  - "Your Results"
- ONE question at a time with single text input
- Button labels match reference:
  - "Submit Answer" (truths phase)
  - "Submit Guess" (guesses phase)
- Placeholder text matches reference:
  - "Your answer..." (truths)
  - "What would they say?" (guesses)
- Progress indicator shows current question
- Questions stored in centralized constants file

**Questions in `/client/constants/loveMapQuestions.ts`:**
1. What is your partner's favorite way to spend an evening?
2. What stresses your partner currently?
3. What are your partner's dreams and aspirations?
4. What is your partner's favorite movie?
5. What is your partner's biggest fear?
6. What would your partner do if they won the lottery?
7. What is your partner's favorite meal?
8. Who is your partner's best friend?
9. What makes your partner feel most loved?
10. What is your partner's favorite way to relax?

---

## C) Weekly Check-in

**Files:**
- Target: `client/screens/tools/WeeklyCheckinScreen.tsx`
- Reference: `reference/couplestherapy-main/mobile/src/screens/client/WeeklyCheckinScreen.tsx`

**Status:** Aligned

**Matching Elements:**
- Title: "Weekly Check-In"
- Subtitle: "Share how you're feeling and strengthen your connection"
- Three rating categories match reference exactly:
  - "Mood (1-10)"
  - "Connection with Partner (1-10)"
  - "Stress Level (1-10)"
- Rating input: 1-10 button grid (matches reference)
- "Reflection" text field with placeholder "What's on your mind this week?"
- Reflection is required for submission (matches reference)
- Privacy toggle with labels:
  - "Private (Only You)"
  - "Shared (With Partner)"
- "Recent Check-Ins" section showing last 5 entries
- Each check-in card displays:
  - Date
  - Private badge (if applicable)
  - Mood/Connection/Stress ratings
  - Reflection text

**Database Schema:** `Couples_weekly_checkins` table with:
- `mood_rating` (integer 1-10)
- `connection_rating` (integer 1-10)
- `stress_level` (integer 1-10)
- `reflection` (text, required)
- `is_private` (boolean)

---

## D) Date Night Generator

**Files:**
- Target: `client/screens/couple/DateNightScreen.tsx`
- Reference: `reference/couplestherapy-main/mobile/src/screens/client/DateNightScreen.tsx`

**Status:** Aligned

**Matching Elements:**
- Title: "Date Night Generator"
- Subtitle: "Get AI-powered date ideas tailored to your preferences"
- Interests section:
  - "Select Your Interests" heading
  - 12 interest categories matching reference:
    - Dining & Food, Outdoor Activities, Arts & Culture, Entertainment
    - Relaxation, Adventure, Learning, Sports & Fitness
    - Music & Dance, Romantic, Social Activities, At-Home Fun
  - Multi-select grid layout
- Location section:
  - "Location" heading
  - Text input with placeholder "Enter city or zip code"
- Distance section:
  - "Distance: X miles" label
  - Button options: 5mi, 10mi, 15mi, 20mi, 30mi (matches reference exactly)
- Generate button: "Generate Date Ideas"
- Loading state: "Generating personalized date ideas..."
- Results section:
  - "Your Date Ideas" heading
  - Card layout for each idea with:
    - Title (h4 style)
    - Description
    - Location (optional, with map pin icon)
    - Estimated cost (optional, with dollar icon)

---

## Summary

| Screen | Status | Changes Made |
|--------|--------|--------------|
| Love Language Quiz | Aligned | Already matched reference - 5 options per question |
| Love Map Quiz | Aligned | Extracted questions to constants, verified phase labels |
| Weekly Check-in | Aligned | Renamed ratings, added reflection/privacy/history |
| Date Night Generator | Aligned | Already matched reference pattern |

---

## Verification Checklist

- [x] All screens render without runtime errors
- [x] TypeScript compiles without errors
- [x] Navigation preserved
- [x] Existing Supabase storage maintained
- [x] Question wording matches reference
- [x] Screen flow matches reference
- [x] Field labels match reference
- [x] Button labels match reference
- [x] Results display structure matches reference
