# ARVR 3D Modelling - Three.js Project

A Three.js-based 3D environment with first-person and third-person camera modes, featuring a controllable character (Minion) and a 3D map.

## Features

- 🎮 **Dual Camera Modes**: Switch between First-Person and Third-Person views
- 🚶 **Character Movement**: WASD controls with sprint and jump functionality
- 🗺️ **3D Environment**: Custom GLB map with FBX character model
- 📍 **Real-time Coordinates**: Live position display on screen

## Controls

| Key | Action |
|-----|--------|
| `W` | Move Forward |
| `S` | Move Backward |
| `A` | Move Left |
| `D` | Move Right |
| `Shift` | Sprint |
| `Space` | Jump |
| `1` | First-Person Mode |
| `3` | Third-Person Mode |

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DHANUSH222005/ARVR_3D_MODELLING.git
   cd ARVR_3D_MODELLING
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install:
   - `three` - Three.js library for 3D rendering
   - `parcel` - Build tool and development server

3. **Run the development server**
   ```bash
   parcel index.html
   ```

4. **Open in browser**
   Navigate to `http://localhost:1234` (or the port shown in terminal)

## Project Structure

```
threejs/
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
├── draco/              # Draco decoder for compressed 3D models
│   ├── draco_decoder.js
│   └── draco_wasm_wrapper.js
├── src/
│   ├── assets/         # 3D models (GLB, FBX files)
│   └── js/
│       └── script.js   # Main application code
├── dist/               # Production build output (generated)
├── node_modules/       # Installed packages (generated)
└── .parcel-cache/      # Parcel cache (generated)
```

## Important Notes

### Files NOT to upload (add to .gitignore):
- `node_modules/` - Installed automatically via `npm install`
- `dist/` - Generated during build
- `.parcel-cache/` - Parcel's cache directory

### Required files to include:
- `draco/` folder - Required for loading compressed GLB models
- `src/assets/` - Your 3D model files (GLB, FBX)
- All other source files

## Dependencies

### Production Dependencies
- **three** (^0.181.1) - JavaScript 3D library

### Development Dependencies
- **parcel** (^2.16.1) - Web application bundler

## Building for Production

```bash
npm run build
```

This creates optimized files in the `dist/` folder.

## Troubleshooting

- **Draco loader error**: Ensure the `draco/` folder is in the root directory
- **Model not loading**: Check that asset paths in `script.js` are correct
- **Port already in use**: Kill existing process or use `parcel index.html --port 3000`

## License

ISC

## Author

DHANUSH M HEGDE   PES1UG23CS181
DEEPAK S N        PES1UG23CS178
SRUJAN C S        PES1UG23CS601
