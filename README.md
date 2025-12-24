# 💎 Constella - Web3 3D Blockchain Constellation Explorer

A **world-class Web3 3D blockchain visualization platform** with cinematic glassmorphism UI and fully immersive Three.js universe.

![Constella Preview](https://via.placeholder.com/800x400/000000/FFFFFF?text=Constella+3D+Blockchain+Explorer)

## 🌟 Features

### 🌌 3D Blockchain Universe with Physics
- **Blocks as Stars**: Each blockchain block appears as a glowing star with size and brightness based on transaction count and gas usage
- **Contracts as Planets**: Smart contracts orbit as planets with rings representing function types
- **Transaction Trails**: Live transactions flow as animated particle trails between blocks and contracts
- **Physics Simulation**: Realistic gravitational attraction, repulsion, anchoring, and damping for smooth celestial motion
- **GPU Acceleration**: Optimized rendering with instancing and adaptive LOD

### 🎨 Glassmorphism UI
- **Premium Design**: Cinematic glass morphism interface with backdrop blur effects
- **Responsive Layout**: Adaptive design that works on all screen sizes
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Dark Theme**: Cosmic black theme with transparent glass elements

### 📊 Real-time Data
- **Live Block Feed**: Real-time blockchain data from public RPC endpoints
- **Multi-chain Support**: Ethereum, Polygon, Base, Arbitrum, Optimism, BSC
- **Smart Contract Analysis**: ABI fetching and function visualization
- **Gas Tracking**: Live gas prices and network statistics

### 🎮 Interactive Controls
- **WASD Navigation**: Keyboard controls for camera movement
- **Mouse Controls**: Orbit, zoom, and pan with smooth inertia
- **Click Interactions**: Click blocks and contracts for detailed information
- **Auto-pilot**: Automatic camera rotation and random navigation

### 🎥 Capture System
- **Screenshots**: High-quality PNG captures of the 3D scene
- **Video Recording**: WebM video recording with quality settings
- **Metadata Overlay**: Optional watermarks and timestamps

### ⚙️ Advanced Settings
- **Performance Tuning**: Adaptive quality, FPS targeting, particle density
- **Physics Controls**: Enable/disable realistic motion simulation
- **Visual Customization**: Bloom effects, animation speed, camera settings
- **Preset Configurations**: Low, Medium, High, Ultra quality presets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Modern browser with WebGL support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd constlla

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI framework
- **Three.js + React Three Fiber** - 3D rendering
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework
- **Zustand** - State management
- **Framer Motion** - Animations
- **Ethers.js** - Blockchain interactions
- **D3 Force** - Graph layouts

### Project Structure
```
src/
├── components/
│   ├── 3D/              # Three.js components
│   ├── ui/              # UI components
│   └── recording/       # Capture system
├── hooks/               # Custom React hooks
├── services/            # API services
├── state/               # Zustand stores
├── utils/               # Utility functions
└── styles/              # Global styles
```

### Data Flow
1. **RPC Service** fetches blockchain data from public endpoints
2. **Etherscan Service** retrieves contract ABIs and metadata
3. **Zustand Stores** manage application state
4. **Custom Hooks** provide reactive data access
5. **3D Components** render blockchain elements in Three.js
6. **UI Components** display information and controls

## ⚛️ Physics System

Constella features a **physically accurate motion system** that brings the blockchain universe to life with realistic celestial mechanics.

### 🔬 Physics Model

The system implements a complete N-body simulation with:

#### **Gravitational Attraction**
```
F_gravity = G * m₁ * m₂ * r / (r² + ε²)^(3/2)
```
- Softened gravity prevents singularities
- Local interaction radius prevents chaos
- Tuned for visual appeal and stability

#### **Collision Avoidance**
```
F_repulsion = k_r * (1 - r/d_min) * n̂  (when r < d_min)
```
- Short-range repulsion prevents overlap
- Maintains clean spatial separation
- Smooth force transitions

#### **Orbital Stability**
```
F_anchor = -k_s * (position - anchor)
```
- Spring forces toward anchor points
- Creates stable orbital patterns
- Prevents drift to infinity

#### **Smooth Motion**
```
F_damping = -γ * velocity
```
- Velocity damping removes jitter
- Creates cinematic inertia
- Ensures natural settling

### 🎮 Motion Characteristics

- **Continuous**: No teleportation or snapping
- **Inertial**: Objects have realistic momentum  
- **Smooth**: All motion is interpolated and damped
- **Responsive**: Hover effects use spring physics
- **Stable**: System energy is conserved and controlled

### ⚙️ Physics Controls

- **Enable/Disable**: Toggle physics simulation
- **Performance Impact**: Linked to quality presets
- **Debug Mode**: Development physics statistics
- **Fixed Timestep**: 60 FPS simulation regardless of framerate

## 🔧 Configuration

### Supported Chains
- **Ethereum** - `https://eth.drpc.org`
- **Polygon** - `https://polygon-rpc.com`
- **Base** - `https://base-rpc.publicnode.com`
- **Arbitrum** - `https://arbitrum.llamarpc.com`
- **Optimism** - `https://optimism.publicnode.com`
- **BSC** - `https://bsc-dataseed.bnbchain.org`

### API Keys
The application uses environment variables for API keys:
- **Etherscan API Key**: Set `VITE_ETHERSCAN_API_KEY` in your environment
- **Hugging Face API Key**: Set `VITE_HUGGING_FACE_API_KEY` in your environment

For development, copy `.env.example` to `.env.local` and add your keys.

### Performance Settings
- **Target FPS**: 15-120 (default: 60)
- **Max Blocks**: 10-500 (default: 100)
- **Max Transactions**: 5-200 (default: 50)
- **Particle Density**: 0.1-2.0 (default: 1.0)

## 🎮 Controls

### Keyboard
- **W/A/S/D** - Camera movement
- **Q/E** - Vertical movement
- **R** - Reset camera
- **Space** - Jump to random element

### Mouse
- **Left Click + Drag** - Rotate camera
- **Right Click + Drag** - Pan camera
- **Scroll Wheel** - Zoom in/out
- **Click Elements** - Select blocks/contracts

## 🎨 Customization

### Visual Settings
- **Particle Density**: Control particle system complexity
- **Bloom Strength**: Adjust glow effects intensity
- **Animation Speed**: Modify animation playback speed
- **Show Labels**: Toggle element labels
- **Particle Trails**: Enable/disable transaction trails

### Performance Optimization
- **Adaptive Quality**: Automatic quality adjustment based on FPS
- **Post Processing**: Toggle expensive visual effects
- **Instance Limits**: Control maximum rendered elements
- **LOD System**: Distance-based level of detail

## 🔮 Future Enhancements

### Planned Features
- **AI Analysis**: GPT-powered contract and transaction insights
- **DeFi Integration**: DEX data and liquidity visualization
- **NFT Gallery**: 3D NFT collection displays
- **Social Features**: Shared universe exploration
- **VR Support**: WebXR virtual reality mode
- **Audio**: Spatial audio for blockchain events

### Technical Roadmap
- **WebAssembly**: Performance-critical computations
- **Web Workers**: Background data processing
- **IndexedDB**: Local blockchain data caching
- **PWA**: Progressive web app capabilities
- **WebRTC**: Real-time collaboration features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🙏 Acknowledgments

- **Three.js Community** - Amazing 3D library and ecosystem
- **React Three Fiber** - Declarative Three.js in React
- **Ethers.js** - Ethereum library and utilities
- **Public RPC Providers** - Free blockchain data access
- **Open Source Community** - Tools and inspiration

---

**Built with ❤️ for the Web3 community**

*Explore the blockchain like never before with Constella's immersive 3D universe.*