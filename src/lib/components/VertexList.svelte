<!-- VertexList.svelte -->
<script>
    import * as d3 from 'd3';
    
    // Props with default values
    let { 
        paths = [], 
        onSelect = () => {} 
    } = $props();
    
    // Extract unique vertices from paths and count occurrences
    let vertexStats = $derived(computeVertexStats(paths));
    
    // Selected vertex for highlighting
    let selectedVertexId = $state(null);
    
    function computeVertexStats(pathsData) {
        // Object to store vertex statistics
        const stats = {};
        
        // Process each path
        pathsData.forEach(pathObj => {
            // For each vertex in the path
            pathObj.path.forEach(vertex => {
                // Convert to string to use as key
                const vertexId = vertex.toString();
                
                // Initialize if first occurrence
                if (!stats[vertexId]) {
                    stats[vertexId] = {
                        id: vertexId,
                        count: 0,
                        asStart: 0,
                        asEnd: 0,
                        asIntermediate: 0
                    };
                }
                
                // Increment total count
                stats[vertexId].count++;
                
                // Check if start vertex
                if (vertex === pathObj.path[0]) {
                    stats[vertexId].asStart++;
                }
                
                // Check if end vertex
                if (vertex === pathObj.path[pathObj.path.length - 1]) {
                    stats[vertexId].asEnd++;
                }
                
                // Check if intermediate vertex (not start or end)
                if (vertex !== pathObj.path[0] && vertex !== pathObj.path[pathObj.path.length - 1]) {
                    stats[vertexId].asIntermediate++;
                }
            });
        });
        
        // Convert to array and sort by vertex ID numerically
        return Object.values(stats).sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }
    
    // Handle vertex selection
    function handleVertexClick(vertex) {
        // Toggle selection
        if (selectedVertexId === vertex.id) {
            selectedVertexId = null;
            onSelect(null);
        } else {
            selectedVertexId = vertex.id;
            onSelect(vertex);
        }
    }
</script>

<div class="vertex-list-container">
    <div class="vertex-list-header">
        <h2>Vertices</h2>
    </div>
    
    <div class="vertex-list-wrapper">
        <div class="vertex-list-content">
            <div class="vertex-list-legend">
                <div class="vertex-id">ID</div>
                <div class="vertex-count">Count</div>
            </div>
            
            <ul>
                {#each vertexStats as vertex}
                    <button 
                        class="vertex-list-item"
                        class:selected={selectedVertexId === vertex.id}
                        onclick={() => handleVertexClick(vertex)}
                    >
                        <div class="vertex-id">{vertex.id}</div>
                        <div class="vertex-count">{vertex.count}</div>
                    </button>
                {/each}
            </ul>
        </div>
    </div>
</div>

<style>
    .vertex-list-container {
        height: 100%;
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        padding: 1em;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }
    
    .vertex-list-header {
        margin-bottom: 1em; /* Fixed margin */
        padding-bottom: 0.5em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 0 0 auto;
        height: 3em; /* Fixed height for the header */
    }
    
    .vertex-list-header h2 {
        margin: 0;
        padding-left: 1em;
        font-size: 1.5rem;
        text-align: left;
        color: #2c3e50;
    }
    
    .vertex-list-wrapper {
        flex: 1;
        display: flex;
        width: 100%;
        overflow: hidden;
        position: relative;
    }
    
    .vertex-list-content {
        flex: 1;
        width: 100%;
        background-color: white;
        border-radius: 8px;
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1), inset 0 -4px 6px rgba(0, 0, 0, 0.1);
        overflow: auto;
    }
    
    .vertex-list-legend {
        display: flex;
        justify-content: space-between;
        padding: 0.5em 1em;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        font-weight: bold;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    
    ul {
        padding: 0.5em;
        margin: 0;
        list-style-type: none;
    }
    
    .vertex-list-item {
        display: flex;
        justify-content: space-between;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        padding: 0.5em 1em;
        margin-top: 0.2em;
        font-family: inherit;
        font-size: inherit;
        cursor: pointer;
        border-radius: 4px;
    }
    
    .vertex-list-item:hover {
        background-color: #f0f2f5;
    }
    
    .vertex-list-item.selected {
        background-color: #e6f0ff;
        color: #0062cc;
        font-weight: 500;
    }
    
    .vertex-id {
        flex: 1;
    }
    
    .vertex-count {
        flex: 1;
        text-align: right;
    }
</style>