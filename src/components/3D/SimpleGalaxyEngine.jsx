/**
 * Simple Galaxy Engine - Basic 3D Universe without complex hooks
 */

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const SimpleGalaxyEngine = () => {
  const groupRef = useRef();
  const [selectedObject, setSelectedObject] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Generate mock blocks and contracts
  const mockData = useMemo(() => {
    const blocks = [];
    const contracts = [];

    // Create more mock blocks
    for (let i = 1; i <= 50; i++) {
      blocks.push({
        number: i,
        position: [
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400
        ],
        hash: `0x${i.toString(16).padStart(64, '0')}`,
        size: 1.0, // Fixed size for all block stars (2x bigger)
        gasUsed: Math.floor(Math.random() * 8000000),
        timestamp: Date.now() - (i * 15000),
        transactions: Math.floor(Math.random() * 200) + 1
      });
    }

    // Create many more contracts as spherical planets
    const contractTypes = ['DeFi Protocol', 'NFT Marketplace', 'DEX', 'Lending Pool', 'Staking Contract', 'Token Contract', 'DAO Governance', 'Bridge Contract'];
    const descriptions = [
      'A decentralized finance protocol enabling automated market making and liquidity provision',
      'A non-fungible token marketplace for digital art and collectibles trading',
      'A decentralized exchange facilitating peer-to-peer cryptocurrency trading',
      'A lending protocol allowing users to borrow and lend digital assets',
      'A staking contract for earning rewards by locking tokens',
      'An ERC-20 token contract with advanced tokenomics features',
      'A decentralized autonomous organization governance contract',
      'A cross-chain bridge enabling asset transfers between blockchains'
    ];
    
    for (let i = 1; i <= 100; i++) {
      contracts.push({
        address: `0x${(i * 100).toString(16).padStart(40, '0')}`,
        position: [
          (Math.random() - 0.5) * 500,
          (Math.random() - 0.5) * 500,
          (Math.random() - 0.5) * 500
        ],
        size: 5.0, // Fixed size for all planets (100px radius - 2x bigger)
        contractName: `${contractTypes[i % contractTypes.length]} ${Math.floor(i/contractTypes.length) + 1}`,
        isVerified: i % 3 === 0,
        contractType: contractTypes[i % contractTypes.length],
        description: descriptions[i % descriptions.length],
        functions: Math.floor(Math.random() * 50) + 5,
        balance: Math.floor(Math.random() * 1000000),
        transactionCount: Math.floor(Math.random() * 10000),
        tvl: Math.floor(Math.random() * 50000000), // Total Value Locked
        users: Math.floor(Math.random() * 100000) + 1000, // Active users
        deployedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    }

    return { blocks, contracts };
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    // Rotate the entire galaxy slowly
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <group ref={groupRef}>


      {/* Block Stars */}
      {mockData.blocks.map((block) => (
        <BlockStarSimple 
          key={`block-${block.number}`} 
          block={block}
          onSelect={setSelectedObject}
        />
      ))}

      {/* Contract Planets - Spherical Planets */}
      {mockData.contracts.map((contract) => (
        <ContractPlanetSimple 
          key={`contract-${contract.address}`} 
          contract={contract}
          onSelect={setSelectedObject}
        />
      ))}

      {/* Details Dropdown */}
      {selectedObject && (
        <Html position={[0, 0, 0]} center>
          <DetailsDropdown 
            object={selectedObject} 
            onClose={() => setSelectedObject(null)}
          />
        </Html>
      )}
    </group>
  );
};

/**
 * Simple Block Star Component
 */
const BlockStarSimple = ({ block, onSelect }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      const scale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp({ x: scale, y: scale, z: scale }, 0.1);
    }
  });

  const handleClick = () => {
    setClicked(!clicked);
    console.log('Block clicked:', block);
    
    const blockDetails = {
      type: 'block',
      title: `Block #${block.number}`,
      data: {
        hash: block.hash,
        timestamp: new Date(block.timestamp).toLocaleString(),
        transactions: block.transactions,
        gasUsed: block.gasUsed.toLocaleString(),
        size: (Math.random() * 50 + 10).toFixed(1) + ' KB',
        difficulty: (Math.random() * 1000000000000).toExponential(2),
        reward: (Math.random() * 2 + 1).toFixed(4) + ' ETH'
      },
      description: 'A block is a collection of transactions that have been verified and added to the blockchain. Each block contains a cryptographic hash of the previous block, creating an immutable chain of records.'
    };
    
    onSelect(blockDetails);
  };

  const handleHover = (isHovering) => {
    setHovered(isHovering);
    document.body.style.cursor = isHovering ? 'pointer' : 'default';
  };

  return (
    <group position={block.position}>
      <mesh 
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => handleHover(true)}
        onPointerOut={() => handleHover(false)}
      >
        <sphereGeometry args={[block.size, 12, 12]} />
        <meshStandardMaterial
          color={clicked ? "#00ff00" : "#ffffff"}
          emissive={clicked ? "#002200" : "#ffffff"}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Subtle glow */}
      <mesh>
        <sphereGeometry args={[block.size * 1.3, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={hovered ? 0.15 : 0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

/**
 * Simple Contract Planet Component - Spherical planets with Web3 details
 */
const ContractPlanetSimple = ({ contract, onSelect }) => {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Generate spherical wireframe geometry (fixed size)
  const sphereGeometry = useMemo(() => {
    return new THREE.SphereGeometry(5.0, 16, 12); // Fixed 100px radius (2x bigger)
  }, []);

  const wireframeGeometry = useMemo(() => {
    return new THREE.WireframeGeometry(sphereGeometry);
  }, [sphereGeometry]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x += delta * 0.05;
      const scale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp({ x: scale, y: scale, z: scale }, 0.1);
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.15;
      wireframeRef.current.rotation.z += delta * 0.03;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse * (hovered ? 1.2 : 1));
    }
  });

  const handleClick = () => {
    setClicked(!clicked);
    console.log('Contract clicked:', contract);
    
    const contractDetails = {
      type: 'contract',
      title: contract.contractName,
      data: {
        address: contract.address,
        type: contract.contractType,
        deployed: contract.deployedDate,
        verified: contract.isVerified ? '✅ Yes' : '❌ No',
        balance: contract.balance.toLocaleString() + ' ETH',
        tvl: '$' + contract.tvl.toLocaleString() + ' USD',
        transactions: contract.transactionCount.toLocaleString(),
        users: contract.users.toLocaleString(),
        functions: contract.functions
      },
      description: contract.description,
      security: contract.isVerified ? 
        'This contract has been verified and audited, meaning its source code is publicly available and has been reviewed for security vulnerabilities.' : 
        'This contract is not verified. Exercise caution when interacting with unverified contracts as their source code is not publicly available.'
    };
    
    onSelect(contractDetails);
  };

  const handleHover = (isHovering) => {
    setHovered(isHovering);
    document.body.style.cursor = isHovering ? 'pointer' : 'default';
  };

  return (
    <group position={contract.position}>
      {/* Main spherical planet */}
      <mesh 
        ref={meshRef}
        geometry={sphereGeometry}
        onClick={handleClick}
        onPointerOver={() => handleHover(true)}
        onPointerOut={() => handleHover(false)}
      >
        <meshStandardMaterial
          color={clicked ? "#ffaa88" : "#ffcc99"}
          emissive={clicked ? "#332211" : "#331100"}
          emissiveIntensity={0.03}
          transparent
          opacity={hovered ? 0.4 : 0.25}
        />
      </mesh>
      
      {/* Wireframe overlay for structure */}
      <lineSegments ref={wireframeRef} geometry={wireframeGeometry}>
        <lineBasicMaterial 
          color={contract.isVerified ? "#ff8844" : "#ffaa66"} 
          transparent 
          opacity={hovered ? 0.8 : 0.5} 
        />
      </lineSegments>
      
      {/* Central core */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial
          color={contract.isVerified ? "#ff6633" : "#ffaa77"}
          emissive={contract.isVerified ? "#331100" : "#221100"}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Pulsing outer glow */}
      <mesh ref={glowRef} geometry={sphereGeometry}>
        <meshBasicMaterial
          color={contract.isVerified ? "#ff8844" : "#ffcc99"}
          transparent
          opacity={hovered ? 0.1 : 0.03}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbital rings for verified contracts */}
      {contract.isVerified && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[6.5, 6.8, 32]} />
            <meshBasicMaterial
              color="#ff6633"
              transparent
              opacity={hovered ? 0.6 : 0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <ringGeometry args={[7.0, 7.1, 32]} />
            <meshBasicMaterial
              color="#ff8844"
              transparent
              opacity={hovered ? 0.4 : 0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

/**
 * Details Dropdown Component
 */
const DetailsDropdown = ({ object, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="relative max-w-lg w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1">{object.title}</h2>
            <span className="text-xs md:text-sm text-blue-400 font-medium">
              {object.type === 'contract' ? '🌐 Smart Contract' : '⭐ Blockchain Block'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl md:text-3xl leading-none p-2 hover:bg-white/10 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Data Grid */}
          <div className="space-y-3">
            <h3 className="text-base md:text-lg font-semibold text-white mb-3">📊 Details</h3>
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {Object.entries(object.data).map(([key, value]) => (
                <div 
                  key={key} 
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 md:p-3 rounded-lg md:rounded-xl gap-1 sm:gap-0"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <span className="text-white/80 capitalize font-medium text-sm md:text-base">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-white font-mono text-xs md:text-sm bg-black/20 px-2 py-1 rounded break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div 
            className="p-3 md:p-4 rounded-lg md:rounded-xl"
            style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
          >
            <h3 className="text-blue-400 font-semibold mb-2 md:mb-3 flex items-center text-sm md:text-base">
              📖 Description
            </h3>
            <p className="text-white/90 leading-relaxed text-sm md:text-base">{object.description}</p>
          </div>

          {/* Security Info (for contracts) */}
          {object.security && (
            <div 
              className="p-3 md:p-4 rounded-lg md:rounded-xl"
              style={{ 
                background: object.data.verified?.includes('✅') 
                  ? 'rgba(34, 197, 94, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${object.data.verified?.includes('✅') 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)'}`
              }}
            >
              <h3 className={`font-semibold mb-2 md:mb-3 flex items-center text-sm md:text-base ${
                object.data.verified?.includes('✅') ? 'text-green-400' : 'text-red-400'
              }`}>
                {object.data.verified?.includes('✅') ? '🔒 Security' : '⚠️ Security Warning'}
              </h3>
              <p className="text-white/90 leading-relaxed text-sm md:text-base">{object.security}</p>
            </div>
          )}

          {/* Web3 Info */}
          <div 
            className="p-3 md:p-4 rounded-lg md:rounded-xl"
            style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}
          >
            <h3 className="text-purple-400 font-semibold mb-2 md:mb-3 flex items-center text-sm md:text-base">
              🔧 Web3 Functionality
            </h3>
            <p className="text-white/90 leading-relaxed text-sm md:text-base">
              {object.type === 'contract' 
                ? 'This smart contract operates on the Ethereum blockchain, enabling decentralized interactions without intermediaries. Users can interact through Web3 wallets like MetaMask, executing functions that are permanently recorded on the blockchain.'
                : 'This block has been validated by the network consensus mechanism and is permanently recorded on the blockchain, making it tamper-proof and transparent. Each block contains a cryptographic hash linking it to the previous block.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-white/10 flex justify-center">
          <button 
            onClick={onClose}
            className="px-6 md:px-8 py-3 rounded-lg md:rounded-xl font-semibold text-white transition-all transform hover:scale-105 text-sm md:text-base min-h-[44px]"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleGalaxyEngine;