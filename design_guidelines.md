# Couples Therapy Mobile App - Design Guidelines

## 1. Brand Identity

**Purpose**: A relationship wellness app providing daily tools for couples and a management dashboard for therapists. This is a safe, intimate space for vulnerable conversations and growth.

**Aesthetic Direction**: Soft/calming with intentional warmth
- Gentle curves, breathing room, rounded corners throughout
- Calming pastels with one warm accent for trust-building actions
- Minimal visual noise - the content (conversations, reflections) is the focus
- Organic, flowing transitions to reduce anxiety

**Memorable Element**: The app feels like a gentle guide, not a clinical tool. Soft haptic feedback during the Pause Button creates a physical sense of calm.

## 2. Navigation Architecture

**Auth Required**: Yes (Supabase auth with expo-secure-store)
- Apple Sign-In + Google Sign-In
- OR email/password with invitation code (for couples linking)

**Root Navigation**: Role-based Tab Navigation

**Navigation Flow**:
1. **AuthStack** (Stack)
   - LoginScreen
   - CoupleSignupScreen (includes invitation code input)
   - TherapistSignupScreen

2. **RoleGateScreen** (determines user role)

3. **CoupleTabs** (5 tabs) - Bottom Tab Navigator
   - Home (center tab with elevated design)
   - Connect
   - Activities
   - Plan
   - Profile

4. **TherapistTabs** (4 tabs) - Bottom Tab Navigator
   - Dashboard
   - Couples
   - Manage
   - Profile

## 3. Screen-by-Screen Specifications

### AuthStack Screens

**LoginScreen**
- **Layout**: Centered form, scrollable
  - Header: Transparent, no buttons
  - Main: Logo/illustration at top, form fields, SSO buttons below
  - Top inset: insets.top + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- **Components**: Email input, password input, SSO buttons (Apple, Google), "Create account" link
- **Empty State**: N/A

**CoupleSignupScreen**
- **Layout**: Scrollable form
  - Header: Back button (left), transparent
  - Main: Display name input, email, password, invitation code input, submit button
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- **Components**: Text inputs, primary button, helper text for invitation code
- **Empty State**: N/A

**TherapistSignupScreen**
- **Layout**: Scrollable form (similar to CoupleSignupScreen)
  - Header: Back button (left), transparent
  - Main: Display name, email, password, submit button
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- **Components**: Text inputs, primary button
- **Empty State**: N/A

### CoupleTabs Screens

**Home Tab**
- **Layout**: Scrollable
  - Header: Transparent, partner names displayed (top), profile icon (right)
  - Main: Quick access cards for tools, recent activity feed
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**: Large rounded cards with tool icons, activity feed list
- **Empty State**: welcome-couple.png (first-time user illustration)

**Connect Tab**
- **Layout**: Scrollable
  - Header: Transparent, "Connect" title
  - Main: Weekly check-in card (prominent), gratitude feed, journal entries
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**: Featured card, list of entries with thumbnails
- **Empty State**: empty-gratitude.png (for gratitude), empty-journal.png (for journal)

**Activities Tab** (center - elevated floating button)
- **Layout**: Modal/Full screen
  - Header: Close button (left), "Activities" title
  - Main: List of activities/tools (Pause Button, Echo & Empathy, Hold Me Tight)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- **Components**: Large list items with tool icons
- **Empty State**: N/A

**Plan Tab**
- **Layout**: Scrollable
  - Header: Transparent, "Plan" title, add button (right)
  - Main: Date night suggestions, rituals list
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**: Cards for date nights, list items for rituals
- **Empty State**: empty-plans.png

**Profile Tab**
- **Layout**: Scrollable
  - Header: Transparent, "Profile" title, settings icon (right)
  - Main: Partner avatars, relationship stats, settings list
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**: Avatar pair, stat cards, settings list
- **Empty State**: N/A

### Tool Flow Screens (nested modals/stacks)

**Pause Button Tool**
- **Layout**: Full screen, non-scrollable
  - Header: Close button (left), transparent
  - Main: Large breathing circle animation, timer, step instructions
  - Floating: Next/Done button (bottom center)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- **Components**: Animated SVG circle, timer display, step text
- **Empty State**: N/A

**Echo & Empathy Tool**
- **Layout**: Scrollable cards (swipeable)
  - Header: Close button (left), progress indicator (center), transparent
  - Main: Speaker/listener role cards with prompts
  - Floating: Action buttons (bottom)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
- **Components**: Role cards, prompt text, action buttons
- **Empty State**: N/A

### TherapistTabs Screens

**Dashboard Tab**
- **Layout**: Scrollable
  - Header: Transparent, "Dashboard" title
  - Main: Stats cards, recent couple activity summary
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**: Stat cards, activity list
- **Empty State**: empty-dashboard.png

**Couples Tab**
- **Layout**: List
  - Header: Transparent, "Couples" title, search bar
  - Main: List of couples with brief info
  - Top inset: headerHeight + searchBarHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**: List items with couple names, last active date
- **Empty State**: empty-couples.png

**Manage Tab**
- **Layout**: Scrollable
  - Header: Transparent, "Invites" title, add button (right)
  - Main: Active invites list, generate new invite button
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
- **Components**: Invite code cards, generate button
- **Empty State**: empty-invites.png

## 4. Color Palette

**Primary**: #8B9DC3 (Soft blue-gray - calming, trustworthy)
**Accent**: #E8A59C (Warm peach - connection, warmth)
**Background**: #F9F7F4 (Off-white with slight warmth)
**Surface**: #FFFFFF (Pure white cards)
**Text Primary**: #2D3748 (Dark gray, not pure black)
**Text Secondary**: #718096 (Medium gray)
**Success**: #81C995 (Soft green)
**Warning**: #F6C177 (Gentle amber)
**Error**: #E88B8B (Muted red)

## 5. Typography

**Font**: Nunito (warm, approachable) from Google Fonts
**Scale**:
- Title: Nunito Bold, 28px
- Heading: Nunito SemiBold, 20px
- Body: Nunito Regular, 16px
- Caption: Nunito Regular, 14px
- Button: Nunito SemiBold, 16px

## 6. Visual Design

- **Icons**: Feather icons from @expo/vector-icons
- **Touchable Feedback**: Opacity 0.7 on press for list items, scale 0.95 for buttons
- **Floating Buttons**: Use shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- **Cards**: Rounded corners (12px), subtle shadow
- **Border Radius**: 12px (cards), 24px (buttons), 50% (avatars)

## 7. Assets to Generate

**Required Assets**:
1. **icon.png** - App icon with overlapping couple silhouette or abstract heart/connection symbol - Used on device home screen
2. **splash-icon.png** - Same as icon but larger - Used during app launch
3. **welcome-couple.png** - Illustration of two figures holding hands, gentle colors - Home tab empty state
4. **empty-gratitude.png** - Small heart or flower icon - Connect tab when no gratitude entries
5. **empty-journal.png** - Open journal illustration - Connect tab when no journal entries
6. **empty-plans.png** - Calendar with a small heart - Plan tab when no date nights/rituals
7. **empty-dashboard.png** - Therapist clipboard illustration - Therapist dashboard empty state
8. **empty-couples.png** - Simple "no couples" icon - Therapist couples list empty state
9. **empty-invites.png** - Envelope or key icon - Therapist manage tab empty state
10. **avatar-couple-1.png** - Preset avatar option for couple (gender-neutral)
11. **avatar-couple-2.png** - Preset avatar option for couple (gender-neutral)
12. **avatar-therapist.png** - Preset avatar for therapist

**Style**: Minimal, soft line art with gentle colors matching the palette. Avoid overly detailed or busy illustrations.