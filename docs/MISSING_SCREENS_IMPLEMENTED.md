# Missing Screens Implementation Documentation

This document describes all the screens implemented to match the reference implementation (couplestherapy-main), plus admin management pages.

## Mobile Screens (Couple Experience)

### 1. AnalyticsScreen

- **Path**: `client/screens/couple/AnalyticsScreen.tsx`
- **Route**: `Analytics`
- **Purpose**: Displays usage analytics for a couple including tools used, frequency, last used, and trends.
- **Data Tables**: `Couples_tool_entries`
- **Features**:
  - Summary cards for 7-day and 30-day activity
  - Most used tool highlight
  - Tool usage breakdown with visual bars
  - Aggregated counts by tool name

### 2. CheckinHistoryScreen

- **Path**: `client/screens/couple/CheckinHistoryScreen.tsx`
- **Route**: `CheckinHistory`
- **Purpose**: Shows historical weekly check-ins with trends and averages.
- **Data Tables**: `Couples_weekly_checkins`
- **Features**:
  - Average scores for connection, communication, and intimacy
  - Chronological list of past check-ins
  - Color-coded rating indicators
  - Notes display

### 3. MoodTrackerScreen

- **Path**: `client/screens/tools/MoodTrackerScreen.tsx`
- **Route**: `MoodTracker`
- **Purpose**: Daily mood logging and visualization.
- **Data Tables**: `Couples_moods`
- **Features**:
  - 1-10 mood scale with labels
  - Optional notes
  - Daily logging with "already logged" state
  - Recent moods history (14 days)

### 4. SettingsScreen

- **Path**: `client/screens/couple/SettingsScreen.tsx`
- **Route**: `Settings`
- **Purpose**: User preferences for notifications and privacy.
- **Data Tables**: `user_settings`
- **Features**:
  - Push notification toggle
  - Email notification toggle
  - Share check-ins with therapist toggle
  - Logout functionality

### 5. ConflictResolutionScreen

- **Path**: `client/screens/tools/ConflictResolutionScreen.tsx`
- **Route**: `ConflictResolution`
- **Purpose**: Guided step-by-step conflict resolution process.
- **Data Tables**: `Couples_tool_entries`
- **Features**:
  - 5-step flow: Define Issue → Feelings → Needs → Requests → Agreement
  - Progress indicator
  - Completion summary with agreement recap
  - Entry saved to tool entries

### 6. CompatibilityScreen

- **Path**: `client/screens/tools/CompatibilityScreen.tsx`
- **Route**: `Compatibility`
- **Purpose**: Compatibility assessment comparing partner answers.
- **Data Tables**: `compatibility_results`
- **Features**:
  - 8 questions across categories (Quality Time, Communication, Intimacy, etc.)
  - 5-point scale responses
  - Waiting state when partner hasn't completed
  - Compatibility percentage calculation when both complete
  - Retake functionality

### 7. GrowthPlanScreen

- **Path**: `client/screens/couple/GrowthPlanScreen.tsx`
- **Route**: `GrowthPlan`
- **Purpose**: Personalized growth plan with milestones.
- **Data Tables**: `growth_plans`
- **Features**:
  - Create new plans with title
  - Add milestones to plans
  - Toggle milestone completion
  - Progress percentage display

### 8. ProgressTimelineScreen

- **Path**: `client/screens/couple/ProgressTimelineScreen.tsx`
- **Route**: `ProgressTimeline`
- **Purpose**: Timeline of relationship milestones and tool completions.
- **Data Tables**: `Couples_weekly_checkins`, `Couples_tool_entries`, `growth_plans`, `shared_goals`
- **Features**:
  - Aggregated feed from multiple sources
  - Grouped by month
  - Color-coded event types
  - Visual timeline with connecting lines

### 9. DailySuggestionScreen

- **Path**: `client/screens/couple/DailySuggestionScreen.tsx`
- **Route**: `DailySuggestion`
- **Purpose**: Daily relationship suggestion/tip.
- **Data Tables**: `daily_suggestions`
- **Features**:
  - Generate suggestion button
  - Today's tip display with steps
  - Save/unsave suggestions
  - Share functionality
  - Saved suggestions history

### 10. ChoreChartScreen

- **Path**: `client/screens/tools/ChoreChartScreen.tsx`
- **Route**: `ChoreChart`
- **Purpose**: Shared chores assignment and tracking.
- **Data Tables**: `Couples_chores`
- **Features**:
  - Add new chores
  - Toggle todo/done status
  - Assign to self/partner
  - Delete chores
  - Completed chores section

### 11. CoupleSetupScreen

- **Path**: `client/screens/auth/CoupleSetupScreen.tsx`
- **Route**: `CoupleSetup`
- **Purpose**: Post-signup partner linking flow with invite codes.
- **Data Tables**: `couples`, `profiles`
- **Features**:
  - Create couple option (generates 6-digit code)
  - Join partner option (enter code)
  - Copy invite code to clipboard
  - Profile update on successful link

## Admin Screens (Admin-Only)

### 12. AdminDashboardScreen

- **Path**: `client/screens/admin/AdminDashboardScreen.tsx`
- **Route**: `AdminDashboard`
- **Purpose**: System overview and management dashboard.
- **Data Tables**: `user_roles`, `profiles`, `couples`
- **Access Control**: Requires `role='admin'` in `user_roles` table
- **Features**:
  - Total users, couples, therapists stats
  - Recent signups list
  - Quick links to therapist and user management
  - "Access Denied" screen for non-admins

### 13. TherapistManagementScreen

- **Path**: `client/screens/admin/TherapistManagementScreen.tsx`
- **Route**: `AdminTherapistManagement`
- **Purpose**: Manage therapist accounts.
- **Data Tables**: `user_roles`, `profiles`
- **Access Control**: Requires `role='admin'` in `user_roles` table
- **Features**:
  - List all therapists
  - Active/inactive count
  - Activate/deactivate therapist accounts
  - Join date display

### 14. UserManagementScreen

- **Path**: `client/screens/admin/UserManagementScreen.tsx`
- **Route**: `AdminUserManagement`
- **Purpose**: Manage all user accounts.
- **Data Tables**: `user_roles`, `profiles`
- **Access Control**: Requires `role='admin'` in `user_roles` table
- **Features**:
  - Search users by email/name
  - Stats (total, active, in couples)
  - Enable/disable user accounts
  - Role badges and color coding

## Database Migrations

New tables created in `supabase/migrations/20260120_missing_screens_tables.sql`:

| Table | Purpose |
|-------|---------|
| `Couples_moods` | Daily mood entries (1-10 scale) |
| `user_settings` | User notification/privacy preferences |
| `compatibility_results` | Partner compatibility quiz answers |
| `daily_suggestions` | Generated daily relationship tips |
| `Couples_chores` | Shared household chores |
| `user_roles` | Admin/therapist/user role assignments |

All tables have:
- RLS (Row Level Security) enabled
- Appropriate policies for user/couple access
- Performance indexes

## Navigation

All new screens are registered in:
- `client/navigation/RootStackNavigator.tsx`
- Type definitions in `RootStackParamList`

Admin screens are accessible from the Profile screen (requires admin role check).

## Assumptions

1. **Admin Role**: Admins are identified via the `user_roles` table. To make a user admin, insert a row with `role='admin'`.

2. **AI Suggestions**: Currently uses sample suggestions. Future implementation can integrate Supabase Edge Function for AI-generated tips.

3. **Couple Linking**: Uses 6-character alphanumeric codes. First user creates couple, second joins with code.

4. **Compatibility Score**: Calculated as inverse of average answer difference between partners.

5. **Privacy**: All new tables follow existing RLS patterns - users can only access their own or their couple's data.

## Testing

All screens include:
- Loading states
- Empty states
- Error handling
- Pull-to-refresh where applicable
- Haptic feedback on key interactions
