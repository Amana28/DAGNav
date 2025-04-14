<!-- CytoscapeGraph.svelte -->
<script>
	import cytoscape from 'cytoscape';
    // import * as d3 from 'd3';

    let { graphmlData, layout, style, highlightedPath = null } = $props();
	let container;
    let cy;
    
    // Function to calculate positions with level-based constraint (custom DAG layout)
    async function calculateDAGPositions(nodes, edges) {
        // Create adjacency list for parent-child relationships
        const childrenMap = {};
        nodes.forEach(n => {
            childrenMap[n.id()] = [];
        });
        
        edges.forEach(e => {
            const sourceId = e.source().id();
            const targetId = e.target().id();
            if (childrenMap[sourceId]) {
                childrenMap[sourceId].push(targetId);
            }
        });
        
        // Create a map of incoming edges (parents) for each node
        const parentsMap = {};
        nodes.forEach(n => {
            parentsMap[n.id()] = [];
        });
        
        edges.forEach(e => {
            const sourceId = e.source().id();
            const targetId = e.target().id();
            if (parentsMap[targetId]) {
                parentsMap[targetId].push(sourceId);
            }
        });
        
        // Identify cycles and break them -- ensure graph is a DAG
        // For any edge that would go upwards, we'll avoid using it for level assignment
        function identifyCycles() {
            const levelMap = {};
            const visited = new Set();
            const tempVisited = new Set(); // For cycle detection
            const edgesToIgnore = new Set();
            
            function dfs(nodeId, level = 0) {
                if (tempVisited.has(nodeId)) {
                    // We found a cycle
                    return true;
                }
                
                if (visited.has(nodeId)) {
                    // Already visited and assigned a level
                    return false;
                }
                
                tempVisited.add(nodeId);
                levelMap[nodeId] = level;
                
                let foundCycle = false;
                for (const childId of childrenMap[nodeId]) {
                    const result = dfs(childId, level + 1);
                    if (result) {
                        // Mark this edge as part of a cycle
                        edgesToIgnore.add(`${nodeId}-${childId}`);
                        foundCycle = true;
                    }
                }
                
                tempVisited.delete(nodeId);
                visited.add(nodeId);
                return foundCycle;
            }
            
            // Find all root nodes (nodes with no incoming edges)
            const rootNodes = [];
            nodes.forEach(node => {
                const id = node.id();
                if (parentsMap[id].length === 0) {
                    rootNodes.push(id);
                }
            });
            
            // Make sure node 0 is first in the list if it exists
            const zeroIndex = rootNodes.indexOf("0");
            if (zeroIndex > 0) {
                rootNodes.splice(zeroIndex, 1);
                rootNodes.unshift("0");
            }
            
            // Run DFS from each root node
            rootNodes.forEach(rootId => {
                if (!visited.has(rootId)) {
                    dfs(rootId, 0);
                }
            });
            
            // Handle any unvisited nodes
            nodes.forEach(node => {
                const id = node.id();
                if (!visited.has(id)) {
                    dfs(id, 0);
                }
            });
            
            return { levelMap, edgesToIgnore };
        }
        
        // Run cycle detection to get initial level map
        const { edgesToIgnore } = identifyCycles();
        
        // Find all root nodes (nodes with no incoming edges)
        const rootNodes = [];
        nodes.forEach(node => {
            const id = node.id();
            if (parentsMap[id].length === 0) {
                rootNodes.push(id);
            }
        });
        
        // Make sure node 0 is first in the list if it exists
        const zeroIndex = rootNodes.indexOf("0");
        if (zeroIndex > 0) {
            rootNodes.splice(zeroIndex, 1);
            rootNodes.unshift("0");
        }
        
        // Create a mapping of node ID to level with BFS, ignoring cyclic edges
        const levelMap = {};
        const visited = new Set();
        
        // Process all root nodes (no incoming edges) at level 1
        rootNodes.forEach(rootId => {
            if (!visited.has(rootId)) {
                // Start BFS from this root
                const queue = [{ id: rootId, level: 1 }];
                visited.add(rootId);
                levelMap[rootId] = 1;
                
                while (queue.length > 0) {
                    const { id, level } = queue.shift();
                    
                    // Add all children to queue at next level
                    childrenMap[id].forEach(childId => {
                        // Skip edges that are part of cycles
                        if (edgesToIgnore.has(`${id}-${childId}`)) {
                            return;
                        }
                        
                        // If node already visited, ensure it's at a higher or same level
                        if (visited.has(childId)) {
                            levelMap[childId] = Math.max(levelMap[childId], level + 1);
                            return;
                        }
                        
                        visited.add(childId);
                        levelMap[childId] = level + 1;
                        queue.push({ id: childId, level: level + 1 });
                    });
                }
            }
        });
        
        // Handle any nodes not yet visited
        let maxLevel = Math.max(...Object.values(levelMap), 0);
        nodes.forEach(node => {
            const id = node.id();
            if (!levelMap[id]) {
                maxLevel += 1;
                levelMap[id] = maxLevel;
            }
        });
        
        // Resolve any remaining upward edges by adjusting levels
        let changed = true;
        while (changed) {
            changed = false;
            edges.forEach(e => {
                const sourceId = e.source().id();
                const targetId = e.target().id();
                
                // Ensure source is at same or higher level (lower number) than target
                if (levelMap[sourceId] > levelMap[targetId]) {
                    // We need to move the target down
                    levelMap[targetId] = levelMap[sourceId] + 1;
                    changed = true;
                }
            });
        }
        
        // Group nodes by level
        const nodesByLevel = {};
        nodes.forEach(node => {
            const id = node.id();
            const level = levelMap[id];
            if (!nodesByLevel[level]) {
                nodesByLevel[level] = [];
            }
            nodesByLevel[level].push(id);
        });
        
        // Position nodes based on levels
        const levelHeight = 200; // vertical spacing between levels
        const positionMap = {};
        
        Object.entries(nodesByLevel).forEach(([level, nodeIds]) => {
            const y = parseInt(level) * levelHeight;
            const nodeCount = nodeIds.length;
            
            // Distribute nodes evenly across the width
            const spacing = 200; // horizontal spacing between nodes in the same level
            const totalWidth = nodeCount * spacing;
            const startX = -totalWidth / 2;
            
            nodeIds.forEach((nodeId, index) => {
                positionMap[nodeId] = {
                    x: startX + (index * spacing) + spacing/2,
                    y: y
                };
            });
        });
        
        return positionMap;
    }

    function highlightPath(cy, path) {
     
        if (!cy || !cy.elements() || cy.$('node').length === 0) {
            console.log('Cytoscape not ready for highlighting');
            return;
        }
        // Debug information
        console.log('Attempting to highlight path:', path);
        
        if (!path || !cy) {
            console.log('Path or cy is null/undefined');
            return;
        }
        
        // Check if path has enough nodes to be valid
        if (path.length < 2) {
            console.log('Path is too short:', path);
            return;
        }
        
        // Check if each node in the path exists in the graph
        const missingNodes = [];
        for (let i = 0; i < path.length; i++) {
            const nodeId = path[i].toString();
            const node = cy.$id(nodeId);
            if (node.length === 0) {
                missingNodes.push(nodeId);
            }
        }
        
        if (missingNodes.length > 0) {
            console.log('Some nodes in the path do not exist in the graph:', missingNodes);
        }
        
        // Clear any existing highlights
        cy.elements().removeClass('path-highlight path-node');
        
        // Highlight each node in the path
        for (let i = 0; i < path.length; i++) {
            const nodeId = path[i].toString();
            const node = cy.$id(nodeId);
            if (node.length > 0) {
                node.addClass('path-node');
                console.log('Highlighted node:', nodeId);
            }
        }
        
        // Highlight edges between consecutive nodes in the path
        let foundEdges = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const sourceId = path[i].toString();
            const targetId = path[i + 1].toString();
            
            // Find edge between source and target
            const edge = cy.edges(`[source = "${sourceId}"][target = "${targetId}"]`);
            if (edge.length > 0) {
                edge.addClass('path-highlight');
                foundEdges++;
            } else {
                console.log(`No edge found between ${sourceId} and ${targetId}`);
            }
        }
        
        console.log(`Highlighted ${foundEdges} edges out of ${path.length - 1} possible edges`);
    }

    // Function to find all descendants of a node
    function findAllDescendants(cy, nodeId) {
        const descendants = new Set();
        const queue = [nodeId];
        
        while (queue.length > 0) {
            const currentId = queue.shift();
            
            // Get outgoing edges from this node
            const outgoers = cy.$id(currentId).outgoers();
            const children = outgoers.nodes();
            
            children.forEach(child => {
                const childId = child.id();
                if (!descendants.has(childId)) {
                    descendants.add(childId);
                    queue.push(childId);
                }
            });
        }
        
        return Array.from(descendants);
    }
    
    // Function to find all ancestors of a node (nodes that can reach it)
    function findAllAncestors(cy, nodeId) {
        const ancestors = new Set();
        const queue = [nodeId];
        
        while (queue.length > 0) {
            const currentId = queue.shift();
            
            // Get incoming edges to this node
            const incomers = cy.$id(currentId).incomers();
            const parents = incomers.nodes();
            
            parents.forEach(parent => {
                const parentId = parent.id();
                if (!ancestors.has(parentId)) {
                    ancestors.add(parentId);
                    queue.push(parentId);
                }
            });
        }
        
        return Array.from(ancestors);
    }
    
    // Function to find all edges that connect a node to its descendants
    function findDescendantEdges(cy, rootId, descendants) {
        const edges = [];
        const visited = new Set(); // Track visited edges to avoid duplicates
        
        // Helper function to recursively find all edges in paths from root to descendants
        function findPaths(currentId) {
            // Get all outgoing edges from this node
            const outEdges = cy.$id(currentId).outgoers('edge');
            
            outEdges.forEach(edge => {
                const edgeId = edge.id();
                if (visited.has(edgeId)) return; // Skip already visited edges
                visited.add(edgeId);
                
                const targetId = edge.target().id();
                
                // If the target is a descendant, add this edge
                if (descendants.includes(targetId)) {
                    edges.push(edge);
                    // Recursively find paths from this descendant to other descendants
                    findPaths(targetId);
                }
            });
        }
        
        // Start the search from the root node
        findPaths(rootId);
        
        return edges;
    }
    
    // Function to find all edges that connect ancestors to a node
    function findAncestorEdges(cy, nodeId, ancestors) {
        const edges = [];
        const visited = new Set(); // Track visited edges to avoid duplicates
        
        // Helper function to recursively find all edges in paths from ancestors to the node
        function findPaths(currentId) {
            // Get all incoming edges to this node
            const inEdges = cy.$id(currentId).incomers('edge');
            
            inEdges.forEach(edge => {
                const edgeId = edge.id();
                if (visited.has(edgeId)) return; // Skip already visited edges
                visited.add(edgeId);
                
                const sourceId = edge.source().id();
                
                // If the source is an ancestor, add this edge
                if (ancestors.includes(sourceId)) {
                    edges.push(edge);
                    // Recursively find paths from this ancestor's ancestors
                    findPaths(sourceId);
                }
            });
        }
        
        // Start the search from the target node
        findPaths(nodeId);
        
        return edges;
    }

    // Register graphml parser to Cytoscape core only if it doesn't already exist
    if (!cytoscape('core', 'graphml')) {
        cytoscape('core', 'graphml', function() {
            const cy = this;
            
            return {
                parse: function(graphmlString) {
                    // Parse GraphML
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(graphmlString, "text/xml");
                    
                    // Extract nodes
                    const nodes = xmlDoc.getElementsByTagName('node');
                    for (let i = 0; i < nodes.length; i++) {
                        const id = nodes[i].getAttribute('id');
                        cy.add({ data: { id } });
                    }
                    
                    // Extract edges
                    const edges = xmlDoc.getElementsByTagName('edge');
                    for (let i = 0; i < edges.length; i++) {
                        const source = edges[i].getAttribute('source');
                        const target = edges[i].getAttribute('target');
                        const id = `e${i}`;
                        cy.add({ data: { id, source, target } });
                    }
                    
                    return cy;
                }
            };
        });
    }
    
	$effect(() => {
        if (graphmlData && container) {
            // Destroy previous instance if it exists
            if (cy) {
                cy.destroy();
            }
            
            // Create new Cytoscape instance
            cy = cytoscape({
                container,
                style: [
                    // Base node style
                    {
                        selector: 'node',
                        style: {
                            'background-color': '#0062cc',
                            'label': 'data(id)',
                            'color': '#fff',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'width': '60px', // Increased node size
                            'height': '60px', // Increased node size
                            'font-size': '28px', // Increased font size
                            'font-weight': 'bold' // Make labels more readable
                        }
                    },
                    // Base edge style - light gray by default
                    {
                        selector: 'edge',
                        style: {
                            'width': 4, // Increased edge thickness
                            'line-color': '#dddddd',
                            'curve-style': 'bezier',
                            'target-arrow-shape': 'triangle',
                            'target-arrow-color': '#dddddd',
                            'opacity': 0.6,
                            'arrow-scale': 1.5 // Increased arrow size
                        }
                    },
                    // New style for highlighted path nodes
                    {
                        selector: 'node.path-node',
                        style: {
                            'background-color': '#ff9900', // Orange for highlighted path
                            'border-width': 3,
                            'border-color': '#ffcc00', // Light orange border
                            'z-index': 20
                        }
                    },
                    // New style for highlighted path edges
                    {
                        selector: 'edge.path-highlight',
                        style: {
                            'line-color': '#ff9900', // Orange for highlighted path
                            'target-arrow-color': '#ff9900',
                            'width': 5,
                            'opacity': 1,
                            'z-index': 20
                        }
                    },
                    // Highlighted edges (when hovering over source node)
                    {
                        selector: 'edge.highlighted',
                        style: {
                            'line-color': '#999',
                            'target-arrow-color': '#999',
                            'opacity': 1,
                            'z-index': 10,
                            'width': 3.5 // Slightly thicker
                        }
                    },
                    // Purple highlighted edges (between selected nodes)
                    {
                        selector: 'edge.descendant-edge',
                        style: {
                            'line-color': '#b19cd9', // Light purple
                            'target-arrow-color': '#b19cd9',
                            'opacity': 1,
                            'width': 4, // Thicker edges when highlighted
                            'z-index': 20
                        }
                    },
                    // Highlighted nodes (descendants)
                    {
                        selector: 'node.highlighted',
                        style: {
                            'background-color': '#6a0dad', // Dark purple
                            'color': '#fff',
                            'border-width': 3,
                            'border-color': '#b19cd9', // Light purple
                            'z-index': 10
                        }
                    },
                    // Selected node (clicked)
                    {
                        selector: 'node.selected',
                        style: {
                            'background-color': '#9400D3', // Hot purple (darker purple)
                            'border-width': 4,
                            'border-color': '#B19CD9', // Lighter purple for border
                            'z-index': 20,
                            'width': '65px',
                            'height': '65px'
                        }
                    },
                    // Ancestor nodes (right-clicked)
                    {
                        selector: 'node.ancestor',
                        style: {
                            'background-color': '#BA55D3', // Medium orchid (lighter purple)
                            'color': '#fff',
                            'border-width': 3,
                            'border-color': '#E6E6FA', // Lavender (very light purple)
                            'z-index': 10
                        }
                    },
                    // Ancestor edges
                    {
                        selector: 'edge.ancestor-edge',
                        style: {
                            'line-color': '#ffb6c1', // Light pink
                            'target-arrow-color': '#ffb6c1',
                            'opacity': 1,
                            'width': 4,
                            'z-index': 20
                        }
                    }
                ],
                layout: { name: 'preset' }, // Start with preset layout
                elements: []
            });
            
            // Parse GraphML
            cy.graphml().parse(graphmlData);
            
            // Add interactivity 
                    
            // Hover over node to highlight outgoing edges
            cy.on('mouseover', 'node', function(e) {
                const node = e.target;
                const outgoers = node.outgoers('edge');
                outgoers.addClass('highlighted');
            });
            
            cy.on('mouseout', 'node', function(e) {
                // Only remove the regular highlight class, not the descendant-edge or ancestor-edge highlight
                cy.edges().removeClass('highlighted');
            });
            
            // Track selected nodes
            let selectedNode = null;
            let selectedAncestorNode = null;
            
            // Left click on node to highlight all descendants
            cy.on('click', 'node', function(e) {
                // Clear previous selections
                cy.elements().removeClass('highlighted selected descendant-edge ancestor ancestor-edge');
                selectedNode = e.target;
                selectedAncestorNode = null;
                
                // Add selected class to the clicked node
                selectedNode.addClass('selected');
                
                // Find all descendants
                const descendants = findAllDescendants(cy, selectedNode.id());
                
                // Highlight all descendants
                descendants.forEach(descId => {
                    cy.$id(descId).addClass('highlighted');
                });
                
                // Find and highlight edges connecting to descendants
                const descendantEdges = findDescendantEdges(cy, selectedNode.id(), descendants);
                descendantEdges.forEach(edge => {
                    edge.addClass('descendant-edge');
                });
            });
            
            // Right click on node to highlight all ancestors
            cy.on('cxttap', 'node', function(e) {
                // Prevent the browser's context menu
                e.originalEvent.preventDefault();
                
                // Clear previous selections
                cy.elements().removeClass('highlighted selected descendant-edge ancestor ancestor-edge');
                selectedAncestorNode = e.target;
                selectedNode = null;
                
                // Add selected class to the right-clicked node
                selectedAncestorNode.addClass('selected');
                
                // Find all ancestors
                const ancestors = findAllAncestors(cy, selectedAncestorNode.id());
                
                // Highlight all ancestors
                ancestors.forEach(ancId => {
                    cy.$id(ancId).addClass('ancestor');
                });
                
                // Find and highlight edges connecting ancestors to this node
                const ancestorEdges = findAncestorEdges(cy, selectedAncestorNode.id(), ancestors);
                ancestorEdges.forEach(edge => {
                    edge.addClass('ancestor-edge');
                });
            });
            
            // Click on background to clear selection
            cy.on('click', function(e) {
                if (e.target === cy) {
                    // Clicked on background
                    cy.elements().removeClass('highlighted selected descendant-edge ancestor ancestor-edge');
                    selectedNode = null;
                    selectedAncestorNode = null;
                }
            });
        }
    });


    // Apply layout when cy and layout are available
    $effect(() => {
        if (!cy || !layout) return;
        
        if (layout.name === 'customDAGView') {
            // Apply custom DAG layout
            const nodes = cy.nodes();
            const edges = cy.edges();
            
            calculateDAGPositions(nodes, edges).then(positionMap => {
                // Apply positions to nodes
                nodes.forEach(node => {
                    const id = node.id();
                    if (positionMap[id]) {
                        node.position(positionMap[id]);
                    }
                });
                
                // Fit and center
                cy.fit();
                cy.center();
            });
        } else {
            cy.layout(layout).run();
            cy.center();
            cy.fit();
        }
    });

    // Handle path highlighting separately
    $effect(() => {
        if (!cy) return;
        
        // Batch operations to prevent layout recalculation
        cy.batch(() => {
            // First remove existing path highlights
            cy.elements().removeClass('path-highlight path-node');
            
            // Add new path highlights if a path is selected
            if (highlightedPath) {
                highlightPath(cy, highlightedPath);
            }
        });
    });

    
    // Export functions that can be called from parent
    function runLayout(layoutOptions) {
        if (cy) {
            cy.layout(layoutOptions).run();
        }
    }
    
    function zoomFit() {
        if (cy) {
            cy.fit();
            cy.center();
        }
    }
</script>
<div bind:this={container} class="cytoscape-container"></div>
<style>
	.cytoscape-container {
		width: 100%;
		height: 100%;
		position: relative;
		background: white;
		border-radius: 8px;
		box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
	}
</style>