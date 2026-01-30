# Active Context

## Current Focus

Refactoring the application to meet the user's specific requirements:

1. **Logic**: Skip the Draw Phase, ensuring the simulator starts directly at the Group Stage with teams assigned. Confirming the "Best 8 of 3rd places" logic is active and visible.
2. **Design**: Overhauling the UI from a "Dark/Cyber" theme to a "Light/Natural" football theme. This involves changing the Tailwind configuration and updating global styles.

## Recent Changes

- Analyzed `TournamentContext.jsx`:
  - Qualification logic for "best 8 thirds" is already present (`thirdPlaces.sort(...).slice(0, 8)`).
  - Draw logic is present but user wants to skip it.
- Analyzed `tailwind.config.js`:
  - Currently set to `cyber` theme (dark, neon). Needs to be changed.

## Next Steps

1. Create `implementation_plan.md`.
2. Update `TournamentContext` to initialize groups immediately on start (bypass 'DRAW' phase).
3. Update `tailwind.config.js` with new color palette (White/Green/Blue/Slate).
4. Update `index.css` for base light theme styles.
5. Refactor `App.jsx` and other components to remove "Cyber" classes and components (like `DrawPhase` if unused or hidden).
