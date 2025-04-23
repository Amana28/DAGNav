<!-- PathStats.svelte -->
<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import StackedHistogram from './StackedHistogram.svelte';
    import ScatterPlot from './ScatterPlot.svelte';
    
    // Props with default values
    let { 
        paths = [], 
        selectedVertex = null,
        currentPathType = 'train',
        width = 600,
        height = 400
    } = $props();
    
    let container;
    let pathStatsContainer;
    let chartsRendered = $state(false);
    
    // Computed statistics
    let pathStats = $derived(computePathStats(paths));
    let vertexUsage = $derived(computeVertexUsage(paths));
    
    // Chart dimensions - will be set based on container width
    let chartWidth = $state(600);
    let chartHeight = $state(300);
    
    // Path length distribution
    function computePathStats(pathsData) {
        if (!pathsData || pathsData.length === 0) {
            return {
                count: 0,
                lengthDistribution: [],
                avgLength: 0,
                minLength: 0,
                maxLength: 0
            };
        }
        
        // Calculate path length distribution
        const lengthCounts = {};
        let totalLength = 0;
        let minLength = Infinity;
        let maxLength = 0;
        
        pathsData.forEach(pathObj => {
            const length = pathObj.length;
            
            lengthCounts[length] = (lengthCounts[length] || 0) + 1;
            totalLength += length;
            
            if (length < minLength) minLength = length;
            if (length > maxLength) maxLength = length;
        });
        
        // Convert to array format for D3
        const lengthDistribution = Object.entries(lengthCounts)
            .map(([length, count]) => ({
                length: parseInt(length),
                count
            }))
            .sort((a, b) => a.length - b.length);
        
        return {
            count: pathsData.length,
            lengthDistribution,
            avgLength: pathsData.length > 0 ? totalLength / pathsData.length : 0,
            minLength: minLength !== Infinity ? minLength : 0,
            maxLength
        };
    }
    
    // Vertex usage statistics
    function computeVertexUsage(pathsData) {
        const vertexCounts = {};
        
        pathsData.forEach(pathObj => {
            // Use a Set to count each vertex only once per path
            const uniqueVertices = new Set(pathObj.path);
            
            uniqueVertices.forEach(vertex => {
                const vertexId = vertex.toString();
                vertexCounts[vertexId] = (vertexCounts[vertexId] || 0) + 1;
            });
        });
        
        // Convert to array format for D3
        return Object.entries(vertexCounts)
            .map(([vertexId, count]) => ({
                vertexId,
                count,
                frequency: pathsData.length > 0 ? count / pathsData.length * 100 : 0 // percentage of paths
            }))
            .sort((a, b) => b.count - a.count); // Sort by count descending
    }
    
    // Filter paths by a selected vertex
    function getPathsWithVertex(pathsData, vertexId) {
        if (!vertexId) return [];
        
        return pathsData.filter(pathObj => 
            pathObj.path.includes(parseInt(vertexId))
        );
    }
    
    // Handle brush selection
    let selectedPaths = $state([]);
    
    function handleBrush(brushedPaths) {
        selectedPaths = brushedPaths;
    }
    
    // Get filtered paths if a vertex is selected
    let filteredPaths = $derived(
        selectedVertex ? getPathsWithVertex(paths, selectedVertex.id) : []
    );
    
    // Stats about selected vertex
    let vertexStats = $derived(
        selectedVertex ? {
            id: selectedVertex.id,
            totalAppearances: selectedVertex.count,
            pathsIncluding: filteredPaths.length,
            percentOfPaths: paths.length > 0 ? (filteredPaths.length / paths.length * 100).toFixed(2) : 0,
            asStart: selectedVertex.asStart,
            asEnd: selectedVertex.asEnd,
            asIntermediate: selectedVertex.asIntermediate
        } : null
    );
    
    // Handle resize - respect the 70% width ratio of the overall layout
    function handleResize() {
        if (pathStatsContainer) {
            // Set width to 100% of the container
            const containerWidth = pathStatsContainer.clientWidth;
            chartWidth = Math.max(300, containerWidth - 40); // Accounting for padding
            chartHeight = 300;
        }
    }
    
    // On component mount
    onMount(() => {
        pathStatsContainer = container;
        window.addEventListener('resize', handleResize);
        
        // Initial size calculation
        setTimeout(() => {
            handleResize();
            chartsRendered = true;
        }, 100);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
    
    // All available paths for stacked histogram
    let allPaths = $derived([
        ...paths.filter(p => p.type === currentPathType)
    ]);
    
    // Handle highlighting a path
    let hoveredPath = $state(null);
</script>

<div class="path-stats-container" bind:this={container}>
    <div class="path-stats-header">
        <h2>Path Statistics {#if currentPathType}({currentPathType}){/if}</h2>
    </div>
    
    <div class="path-stats-wrapper">
        <div class="path-stats-content">
            <div class="stats-summary">
                <div class="stat-card">
                    <div class="stat-title">Total Paths</div>
                    <div class="stat-value">{pathStats.count}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-title">Avg. Length</div>
                    <div class="stat-value">{Number.isNaN(pathStats.avgLength) ? "0.00" : pathStats.avgLength.toFixed(2)}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-title">Min Length</div>
                    <div class="stat-value">{pathStats.minLength}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-title">Max Length</div>
                    <div class="stat-value">{pathStats.maxLength}</div>
                </div>
                
                {#if currentPathType === 'predicted'}
                <div class="stat-card">
                    <div class="stat-title">Correct Paths</div>
                    <div class="stat-value">{paths.filter(p => p.correct).length}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-title">Error Rate</div>
                    <div class="stat-value">
                        {(paths.length > 0 ? 
                            (paths.filter(p => !p.correct).length / paths.length * 100).toFixed(2) : 
                            "0.00")}%
                    </div>
                </div>
                {/if}
            </div>
            
            {#if selectedVertex}
            <div class="selected-vertex-stats">
                <h3>Selected Vertex: {selectedVertex.id}</h3>
                <div class="vertex-stats-grid">
                    <div class="vertex-stat">
                        <span class="vertex-stat-label">Paths including vertex:</span>
                        <span class="vertex-stat-value">{vertexStats.pathsIncluding} ({vertexStats.percentOfPaths}%)</span>
                    </div>
                    <div class="vertex-stat">
                        <span class="vertex-stat-label">As start node:</span>
                        <span class="vertex-stat-value">{vertexStats.asStart}</span>
                    </div>
                    <div class="vertex-stat">
                        <span class="vertex-stat-label">As end node:</span>
                        <span class="vertex-stat-value">{vertexStats.asEnd}</span>
                    </div>
                    <div class="vertex-stat">
                        <span class="vertex-stat-label">As intermediate node:</span>
                        <span class="vertex-stat-value">{vertexStats.asIntermediate}</span>
                    </div>
                </div>
            </div>
            {/if}
            
            <div class="charts-container">
                <div class="chart-item">
                    <h3>Path Length Distribution</h3>
                    <!-- {#if chartsRendered}
                    <StackedHistogram 
                        paths={allPaths}
                        width={chartWidth}
                        height={chartHeight}
                        marginLeft={60}
                        marginTop={30}
                        marginRight={30}
                        marginBottom={60}
                    />
                    {/if} -->
                </div>
                
                <div class="chart-item">
                    <h3>Path Length vs Node Degrees</h3>
                    <!-- {#if chartsRendered}
                    <ScatterPlot 
                        paths={paths}
                        width={chartWidth}
                        height={chartHeight}
                        marginLeft={60}
                        marginTop={30}
                        marginRight={30}
                        marginBottom={60}
                        highlightedPath={hoveredPath}
                        onbrush={handleBrush}
                    />
                    {/if} -->
                </div>
            </div>
            
            {#if selectedPaths.length > 0 && selectedPaths.length < paths.length}
                <div class="brush-selection">
                    <h3>Selected Paths: {selectedPaths.length}</h3>
                    <div class="brush-stats">
                        <div class="stat">
                            <span class="stat-label">Average Length:</span>
                            <span class="stat-value">
                                {(selectedPaths.reduce((sum, p) => sum + p.length, 0) / selectedPaths.length).toFixed(2)}
                            </span>
                        </div>
                        {#if currentPathType === 'predicted'}
                        <div class="stat">
                            <span class="stat-label">Correct Paths:</span>
                            <span class="stat-value">
                                {selectedPaths.filter(p => p.correct).length} 
                                ({(selectedPaths.filter(p => p.correct).length / selectedPaths.length * 100).toFixed(2)}%)
                            </span>
                        </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .path-stats-container {
        height: 100%;
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        padding: 1em;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }
    
    .path-stats-header {
        margin-bottom: 1em; /* Fixed margin */
        padding-bottom: 0.5em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 0 0 auto;
        height: 3em; /* Fixed height for the header */
    }
    
    .path-stats-header h2 {
        margin: 0;
        padding-left: 1em;
        font-size: 1.5rem;
        text-align: left;
        color: #2c3e50;
    }
    
    .path-stats-wrapper {
        flex: 1;
        display: flex;
        width: 100%;
        overflow: hidden;
        position: relative;
    }
    
    .path-stats-content {
        flex: 1;
        width: 100%;
        background-color: white;
        border-radius: 8px;
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1), inset 0 -4px 6px rgba(0, 0, 0, 0.1);
        overflow: auto;
        padding: 1em;
        box-sizing: border-box;
    }
    
    .stats-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 1em;
        margin-bottom: 2em;
    }
    
    .stat-card {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1em;
        min-width: 120px;
        flex: 1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .stat-title {
        font-size: 0.9rem;
        color: #6c757d;
        margin-bottom: 0.5em;
    }
    
    .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #0062cc;
    }
    
    .selected-vertex-stats {
        background-color: #e6f0ff;
        border-radius: 8px;
        padding: 1em;
        margin-bottom: 2em;
    }
    
    .selected-vertex-stats h3 {
        margin-top: 0;
        color: #0062cc;
        margin-bottom: 1em;
    }
    
    .vertex-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1em;
    }
    
    .vertex-stat {
        display: flex;
        justify-content: space-between;
    }
    
    .vertex-stat-label {
        color: #495057;
    }
    
    .vertex-stat-value {
        font-weight: bold;
    }
    
    .charts-container {
        display: flex;
        flex-direction: column;
        gap: 2em;
        margin-top: 1em;
        width: 100%;
    }
    
    .chart-item {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1em;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        box-sizing: border-box;
    }
    
    .chart-item h3 {
        margin-top: 0;
        margin-bottom: 1em;
        color: #2c3e50;
        text-align: center;
    }
    
    .brush-selection {
        background-color: #f0f8ff;
        border-radius: 8px;
        padding: 1em;
        margin-top: 2em;
    }
    
    .brush-selection h3 {
        margin-top: 0;
        color: #0062cc;
        margin-bottom: 1em;
    }
    
    .brush-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 1em;
    }
    
    .stat {
        flex: 1;
        min-width: 200px;
    }
    
    .stat-label {
        color: #495057;
        margin-right: 0.5em;
    }
    
    @media (min-width: 1200px) {
        .charts-container {
            flex-direction: row;
        }
        
        .chart-item {
            flex: 1;
        }
    }
</style>