/**
 * WebGL utility functions for Three.js optimization
 */

/**
 * Check WebGL capabilities
 */
export const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (error) {
    return false;
  }
};

/**
 * Get WebGL renderer info
 */
export const getWebGLInfo = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return null;
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  
  return {
    vendor: gl.getParameter(gl.VENDOR),
    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
    version: gl.getParameter(gl.VERSION),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
    maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
    maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)
  };
};

/**
 * Calculate optimal instance count based on performance
 */
export const calculateOptimalInstances = (baseCount, performance) => {
  const { fps, quality } = performance;
  
  if (quality === 'low' || fps < 30) {
    return Math.floor(baseCount * 0.5);
  } else if (quality === 'medium' || fps < 45) {
    return Math.floor(baseCount * 0.75);
  }
  
  return baseCount;
};

/**
 * Generate positions for instanced geometry
 */
export const generateInstancePositions = (count, spread = 100) => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;
  }
  
  return positions;
};