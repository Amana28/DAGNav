<!-- GraphView.svelte -->
<script>
	import CytoscapeGraph from '$lib/components/CytoscapeGraph.svelte';
	import OptionSelector from '$lib/components/OptionSelector.svelte';
	
	let { graphmlData, highlightedPath = null } = $props();
    
	// Layout options
	const layouts = {
		cose: { 
			name: 'cose',
			idealEdgeLength: 100,
			nodeOverlap: 200,
			refresh: 20,
			fit: true,
			padding: 200,
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
			name: 'customDAGView',
			fit: true,
			padding: 100,
			animate: true
		},
		concentric: {
			name: 'concentric',
			concentric: function(node) {
				return 10 - node.indegree();
			},
			levelWidth: function(nodes) {
				return 2;
			},
			minNodeSpacing: 100,
			animate: true,
			padding: 100,
			fit: true,
			spacingFactor: 1.2
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
    // Layout selection options for OptionSelector
    const layoutOptions = [
        { value: 'cose', label: 'Force Layout' },
        { value: 'customDAGView', label: 'Custom DAG' },
        { value: 'concentric', label: 'Concentric' }
    ];
	// Path type options 
    const pathTypeOptions = [
        { value: 'train', label: 'Training Paths' },
        { value: 'valid', label: 'Validation Paths' },
        { value: 'predicted', label: 'Predicted Paths' }
    ];
	
	// Handle layout change
	function changeLayout(layoutName) {
		currentLayout = layouts[layoutName];
		console.log('Layout changed to:', layoutName, currentLayout);
	}
	
	// Track container dimensions
	let containerWidth = $state(0);
	let containerHeight = $state(0);
</script>

<div class="graph-view-container" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    <div class="graph-view-header">
		<h2>Graph View [{currentLayout.name}]</h2>
		<!-- Option select component for layout options -->
		<div class="graph-view-selector">
			<OptionSelector 
				options={layoutOptions} 
				activeOption={currentLayout.name} 
				onSelect={changeLayout} 
				iconSrc="/icons/graph-view-icon.png"
			/>
		</div>
	</div>
	
	<div class="cytoscape-wrapper">
		<CytoscapeGraph {graphmlData} layout={currentLayout} {style} {highlightedPath} />
	</div>
</div>

<style>
	.graph-view-container {
		height: 100%;
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        padding: 1em;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
	}
    
    .graph-view-header {
        margin-bottom: 1em; /* Fixed margin */
        padding-bottom: 0.5em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 0 0 auto;
        height: 3em; /* Fixed height for the header */
    }
    
	.graph-view-header h2 {
        margin: 0;
        padding-left: 1em;
        text-align: left;
		font-size: 1.5rem;
		color: #2c3e50;
	}
    
    .graph-view-selector {
        margin-right: 1em;
    }
    
    .cytoscape-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        overflow: hidden;
        position: relative;
    }
</style>