<!-- PathStats.svelte -->
<script>
    import * as d3 from 'd3';
    import StackedHistogram from './StackedHistogram.svelte';
    
    let { 
        paths = [], 
        selectedVertex = null,
        currentPathType = 'train',
        width = 600,
        height = 400
    } = $props();

    // Computed statistics
    let pathStats = $derived(computePathStats(paths));
    let vertexUsage = $derived(computeVertexUsage(paths));

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

    function computeVertexUsage(pathsData) {
        const vertexCounts = {};
        pathsData.forEach(pathObj => {
            const uniqueVertices = new Set(pathObj.path);
            uniqueVertices.forEach(vertex => {
                const vertexId = vertex.toString();
                vertexCounts[vertexId] = (vertexCounts[vertexId] || 0) + 1;
            });
        });

        return Object.entries(vertexCounts)
            .map(([vertexId, count]) => ({
                vertexId,
                count,
                frequency: pathsData.length > 0 ? count / pathsData.length * 100 : 0
            }))
            .sort((a, b) => b.count - a.count);
    }

    function getPathsWithVertex(pathsData, vertexId) {
        if (!vertexId) return [];
        return pathsData.filter(pathObj => pathObj.path.includes(parseInt(vertexId)));
    }

    let filteredPaths = $derived(
        selectedVertex ? getPathsWithVertex(paths, selectedVertex.id) : []
    );

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
    

    // Data Processing for Stacked Histogram
    // Get unique path lengths for color coding without sorting
    const uniquePathLengths = $derived(
    Array.from(new Set(paths.map(path => path.length)))
        .sort((a, b) => a - b)  // Sort numerically in ascending order
    );

    // Create color scale for path lengths
    const color = $derived(
        d3.scaleOrdinal()
        .domain(uniquePathLengths)
        .range(d3.schemeTableau10)
    );

    // Log the color assignments with counts
    $effect(() => {
        // Create a count map for quick lookup
        const lengthCounts = {};
        paths.forEach(path => {
            lengthCounts[path.length] = (lengthCounts[path.length] || 0) + 1;
        });
        
        console.log(`Path lengths with counts for ${currentPathType}:`);
        uniquePathLengths.forEach(length => {
            const count = lengthCounts[length] || 0;
            const percentage = (count / paths.length * 100).toFixed(1);
            console.log(
                `%c  Length ${length}: %c${count} paths (${percentage}%)`,
                `color: ${color(length)}; font-weight: bold;`,
                `color: black; font-weight: normal;`
            );
        });
    });
    
    const plotSize = 400;

</script>

<div class="path-stats-container">
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
                    <div class="stat-value">{(paths.length > 0 ? (paths.filter(p => !p.correct).length / paths.length * 100).toFixed(2) : "0.00")}%</div>
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
                <!-- Histogram container -->
                <div class="histogram-container">
                    <h3>Path Length Distribution</h3>
                    <StackedHistogram 
                        {paths} 
                        {color}
                        uniquePathLengths={uniquePathLengths}
                        width={800}
                        height={700} 
                        marginLeft={60}
                        marginTop={60}
                        marginRight={30} 
                        marginBottom={50} 
                    />
                </div>
                
                <!-- Scatter plot container -->
                <div class="scatter-container">
                    <h3>Path Length vs Vertex Count</h3>
                    <!-- Your scatter plot component will go here -->
                </div>
            </div>
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
        margin-bottom: 1em;
        padding-bottom: 0.5em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 0 0 auto;
        height: 3em;
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
        margin-top: 2em;
        display: flex;
        flex-wrap: wrap;
        gap: 1.5em;
        width: 100%;
    }

    .histogram-container, .scatter-container {
        flex: 1 1 calc(50% - 1.5em);
        min-width: 300px;
        max-width: calc(50% - 0.75em);
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 1em;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        height: auto; 
        min-height: 800px;
        display: flex;
        flex-direction: column;
    }

    .histogram-container h3, .scatter-container h3 {
        margin-top: 0;
        color: #0062cc;
        margin-bottom: 1em;
        flex: 0 0 auto;
    }
</style>