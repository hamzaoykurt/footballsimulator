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
  - Fixed syntax error in `src/data/clTeams.js` (missing `{` in `leftPlayoffs`).

## Next Steps

1. **Debug Deployment**: Investigate why Cloudflare Pages deployment is failing despite local success.
   - Run `npm run build` locally to check for build errors.
   - Check `vite.config.js` and SPA routing configuration (`_redirects`).
   - Verify case-sensitivity of imports.
2. Create `implementation_plan.md` for the original refactoring task (paused for debugging).
3. Update `TournamentContext` to initialize groups immediately on start (bypass 'DRAW' phase).
4. Update `tailwind.config.js` with new color palette (White/Green/Blue/Slate).
5. Update `index.css` for base light theme styles.
6. Refactor `App.jsx` and other components to remove "Cyber" classes.
