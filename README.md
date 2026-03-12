# Space Simulator

A small interactive 3D space simulator built with React + Three.js. It lets you place planets, tweak physical parameters, and watch a simple gravity/physics-driven scene with explosions and camera controls.

Key ideas
- Real-time 3D rendering with `three` and `@react-three/fiber`.
- Simple physics/interaction via `@react-three/cannon` and custom gravity utilities.
- Fast authoring controls using `leva` for spawning and tuning planets.

Tech stack
- Vite + React (TypeScript)
- three, @react-three/fiber, @react-three/drei
- @react-three/cannon for physics
- Tailwind CSS for UI utilities
- Leva for debug/control panels

Prerequisites
- Node.js >= 18 (or a recent LTS)

Getting started

1. Install dependencies

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview the production build

```bash
npm run preview
```

Checks and formatting
- A Biome check is available: `npm run check` (project includes `@biomejs/biome`).
- A pre-commit hook tool (`lefthook`) is present in devDependencies — follow the repository conventions when committing.

