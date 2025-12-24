// Debug script to test the visualization store
// Run this in browser console to check store state

console.log('=== VISUALIZATION STORE DEBUG ===');

// Get the store (assuming it's available globally or via React DevTools)
// This is a manual test script

const testPlanetGeneration = () => {
  console.log('Testing planet generation...');
  
  // Simulate the planet generation logic
  const maxPlanets = 8;
  const planetNames = [
    'Mars', 'Venus', 'Jupiter', 'Saturn', 
    'Mercury', 'Uranus', 'Neptune', 'Pluto'
  ];
  
  console.log(`Should generate ${maxPlanets} planets:`);
  
  for (let i = 0; i < maxPlanets; i++) {
    const angle = (i / maxPlanets) * Math.PI * 2;
    const distance = 80 + (i * 15);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = (Math.random() - 0.5) * 30;
    
    console.log(`Planet ${i} (${planetNames[i]}): [${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}] - Distance: ${distance}`);
  }
};

testPlanetGeneration();

console.log('=== END DEBUG ===');