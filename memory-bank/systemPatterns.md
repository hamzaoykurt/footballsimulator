# System Patterns

## Architecture

- **Framework**: React (Vite)
- **State Management**: `TournamentContext` handles all tournament data (groups, matches, standings, phase).
- **Styling**: Tailwind CSS.
- **Components**: Functional components separated by phase (GroupStage, KnockoutStage).

## Key Workflows

- **Simulation**: Logic for calculating scores is in `calculateMatchResult` in the context.
- **Phase Management**: `phase` state determines the active view (`SETUP` -> `GROUPS` -> `KNOCKOUT`).

## UI Patterns

- **Previous**: Cyber/Dark theme.
- **New Pattern**: Light/Clean theme using standard Tailwind colors or a custom "Football" palette (Grass Green, Sky Blue, White, Slate Text).
