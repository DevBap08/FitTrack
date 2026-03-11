# Life Tracker Project Roadmap

This document outlines the phased development plan for the Life Tracker application, integrating Workout tracking, Calorie tracking, and AI-driven coaching.

## Phase 1 — Backend Foundation (Week 1)
- **Database Models**:
  - Workout Plan: `plan` → `exercises` → `sets`/`reps`.
  - Food Log: `food_logs` (food name, grams, calories, macros).
  - User Profile: `profiles` (height, weight, age, activity level, goal, TDEE).
- **Utility Functions**:
  - BMI calculation.
  - Calorie target calculation based on TDEE and goal (bulk/recomp).
- **Migrations**: Set up Alembic for clean database versioning.

## Phase 2 — Workout Tracker (Week 2–3)
- **Workout Plan Creator**: Interface to create plans (e.g., "Push Day A") with target sets/reps and exercise demo URLs.
- **Workout Logger**: Session-based logging of actual vs. target performance.
- **PR Tracking**: Logic to flag personal records when performance exceeds targets.
- **Rest Timer**: Angular service for background countdown with sound notification.

## Phase 3 — Calorie Tracker (Week 3–4)
- **Food Logging UI**: Fast entry (under 10s) for food and weight.
- **AI Estimation**: Endpoint to estimate calories/macros from natural language food name.
- **Daily Summary**: Visual breakdown of consumed vs. target calories and macro rings (P/C/F).

## Phase 4 — AI Integration (Week 4–5)
- **Unified AI Service**: FastAPI service injected with full user context (BMI, goals, recent calorie logs, workout history).
- **Onboarding Flow**: AI-guided setup for profile and targets.
- **Calorie Coach**: Daily log analysis with food-specific adjustments.
- **Workout Coach**: Progressive overload suggestions and weight adjustments based on performance trends.
- **Cross-Module Insights**: Recovery risk detection (e.g., high activity + low calorie intake).

## Phase 5 — Polish & Refinement (Week 5–6)
- **Progress Visuals**: Charts for weight, strength, and calorie trends.
- **History Views**: Deep dives into past workouts and meals.
- **Smart Search**: Quick logging based on historical data.
- **Persistent AI Chat**: Context-aware chat accessible anytime (e.g., mid-workout).
- **Edge Case Coverage**: Handling skipped days, double workouts, and weekend caloric spikes.
