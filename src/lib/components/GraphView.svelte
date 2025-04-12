<script>
	import CytoscapeGraph from '$lib/components/CytoscapeGraph.svelte';
	import { writable } from 'svelte/store';
	
	let { graphmlData } = $props();
    
	// Layout options
	const layouts = {
		cose: { 
			name: 'cose',
			idealEdgeLength: 100,
			nodeOverlap: 250,
			refresh: 20,
			fit: true,
			padding: 30,
			randomize: false,
			componentSpacing: 100,
			nodeRepulsion: 400000,
			edgeElasticity: 500,
			nestingFactor: 5,
			gravity: 80,
			numIter: 1000,
			initialTemp: 200,
			coolingFactor: 0.95,
			minTemp: 1.0
		},
		customDAGView: {
			name: 'customDAGView', // Renamed from d3Tree
			fit: true,
			padding: 30,
			animate: true
		},
		concentric: {
			name: 'concentric',
			concentric: function(node) {
				// Calculate concentric value based on the node's incoming degree
				// Nodes with fewer incoming connections will be in the center
				return 10 - node.indegree();
			},
			levelWidth: function(nodes) {
				// Nodes will be positioned in levels based on their concentric value
				return 2;
			},
			minNodeSpacing: 100, // Minimum spacing between nodes
			animate: true,
			padding: 30,
			fit: true,
			spacingFactor: 1.2 // Multiplier for spacing between nodes
		}
	};
	
	// Current layout
	let currentLayout = $state(layouts.cose);
	
	// Style for the nodes and edges
	const style = [
		{
			selector: 'node',
			style: {
				'background-color': '#0062cc',
				label: 'data(id)',
				color: '#fff',
				'text-valign': 'center',
				'text-halign': 'center',
				width: '30px',
				height: '30px'
			}
		},
		{
			selector: 'edge',
			style: {
				width: 2,
				'line-color': '#999',
				'curve-style': 'bezier',
				'target-arrow-shape': 'triangle',
				'target-arrow-color': '#999'
			}
		}
	];
	
	// Handle layout change
	function changeLayout(layoutName) {
		currentLayout = layouts[layoutName];
	}
</script>

<div class="graph-view-container">
    <div class="graph-view-header">
        <h2>Graph View</h2>
        <div class="layout-buttons">
            <button class:active={currentLayout.name === 'cose'} onclick={() => changeLayout('cose')}>
                Force Layout
            </button>
            <button class:active={currentLayout.name === 'customDAGView'} onclick={() => changeLayout('customDAGView')}>
                Custom DAG
            </button>
            <button class:active={currentLayout.name === 'concentric'} onclick={() => changeLayout('concentric')}>
                Concentric
            </button>
        </div>
    </div>
	<CytoscapeGraph {graphmlData} layout={currentLayout} {style} />
</div>

<style>
	.graph-view-container {
		width: 100%;
		height: 100%;
		padding: 1em;
	}
    
    .graph-view-header {
        margin-bottom: 1em;
        padding-bottom: 0.5em;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
	h2 {
        margin: 0;
        padding-left: 1em;
        text-align: left;
		font-size: 1.5rem;
		color: #2c3e50;
	}
    
    .layout-buttons {
        display: flex;
        gap: 0.5em;
    }
    
    button {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 0.5em 1em;
        font-size: 0.875rem;
        color: #2c3e50;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    button:hover {
        background-color: #e9ecef;
    }
    
    button.active {
        background-color: #0062cc;
        color: white;
        border-color: #0062cc;
    }
</style>