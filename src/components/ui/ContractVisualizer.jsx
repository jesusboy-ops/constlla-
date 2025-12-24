/**
 * Contract Visualizer Component
 * D3 force graph visualization of smart contract functions
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { select } from 'd3-selection';
import { useContractData } from '../../hooks/useContractData.js';
import { formatFunctionSignature, getFunctionTypeColor } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';
import Loader from './Loader.jsx';

const ContractVisualizer = ({ contract, onClose }) => {
  const svgRef = useRef();
  const simulationRef = useRef();
  const [selectedFunction, setSelectedFunction] = useState(null);
  const { generateVisualizationData } = useContractData();

  useEffect(() => {
    if (!contract || !contract.functions) return;

    const vizData = generateVisualizationData(contract);
    if (!vizData) return;

    const { nodes, links } = vizData;
    
    // Set up SVG
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    
    const width = 600;
    const height = 400;
    
    svg.attr('width', width).attr('height', height);

    // Create simulation
    const simulation = forceSimulation(nodes)
      .force('link', forceLink(links).id(d => d.id).distance(50))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide().radius(d => d.size + 5));

    simulationRef.current = simulation;

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#ffffff20')
      .attr('stroke-width', 2);

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#ffffff40')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (d.type === 'function') {
          setSelectedFunction(d);
        }
      })
      .on('mouseover', function(event, d) {
        select(this).attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        select(this).attr('stroke-width', 1);
      });

    // Add labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('font-size', d => d.type === 'contract' ? 14 : 10)
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'contract' ? 5 : 3)
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [contract, generateVisualizationData]);

  if (!contract) {
    return (
      <GlassCard className="flex items-center justify-center h-64">
        <Loader type="spinner" text="Loading contract..." />
      </GlassCard>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="space-y-4"
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Contract Visualizer
          </h3>
          {onClose && (
            <GlassButton size="sm" onClick={onClose}>✕</GlassButton>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 rounded-lg p-4">
              <svg ref={svgRef} className="w-full" />
            </div>
          </div>

          {/* Contract Info */}
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-2">Contract Info</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-white/60">Name:</span>
                  <span className="text-white ml-2">
                    {contract.contractName || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Functions:</span>
                  <span className="text-white ml-2">
                    {contract.functions?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Verified:</span>
                  <span className={`ml-2 ${contract.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {contract.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div>
              <h4 className="text-white font-semibold mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-white/80">Read Functions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-white/80">Write Functions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-white/80">Payable Functions</span>
                </div>
              </div>
            </div>

            {/* Selected Function Details */}
            {selectedFunction && (
              <div>
                <h4 className="text-white font-semibold mb-2">Function Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Name:</span>
                    <span className="text-white ml-2">{selectedFunction.name}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Type:</span>
                    <span className={`ml-2 ${getFunctionTypeColor(selectedFunction)}`}>
                      {selectedFunction.functionType}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Inputs:</span>
                    <span className="text-white ml-2">{selectedFunction.inputs}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Outputs:</span>
                    <span className="text-white ml-2">{selectedFunction.outputs}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ContractVisualizer;