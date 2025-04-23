<!-- ScatterPlot.svelte -->
<script>
    import * as d3 from 'd3';
    
    // Props with default values
    let { 
        paths = [],
        width = 600,
        height = 400,
        marginLeft = 60,
        marginTop = 30,
        marginRight = 30,
        marginBottom = 60,
        highlightedPath = null,
        onbrush = () => {}
    } = $props();
    
    // Create dataset with required features
    const dataset = $derived(createDataset(paths));
    
    // Calculate total degrees for each path (sum of degrees of all nodes except start and end)
    function createDataset(pathsData) {
        return pathsData.map(pathObj => {
            // Get internal nodes (all except first and last)
            const internalNodes = pathObj.path.slice(1, -1);
            
            // For now, just use the number of nodes as a proxy for "total degrees"
            // In a real implementation, you would calculate actual degrees from the graph
            const totalDegrees = internalNodes.length;
            
            return {
                id: pathObj.raw || `path-${pathObj.path.join('-')}`,
                length: pathObj.length,
                totalDegrees: totalDegrees,
                type: pathObj.type,
                path: pathObj.path,
                correct: pathObj.correct
            };
        });
    }
    
    // Create scales
    const x = $derived(
        d3.scaleLinear()
            .domain(d3.extent(dataset, d => d.length))
            .nice()
            .range([marginLeft, width - marginRight])
    );
    
    const y = $derived(
        d3.scaleLinear()
            .domain(d3.extent(dataset, d => d.totalDegrees))
            .nice()
            .range([height - marginBottom, marginTop])
    );
    
    // Color scale for path types
    const colorScale = $derived(
        d3.scaleOrdinal()
            .domain(['train', 'test', 'predicted'])
            .range(['#4e79a7', '#f28e2c', '#e15759'])
    );
    
    // Setup for brushing
    let svg;
    let brushedPathIds = $state(null);
    
    function brushed(event) {
        if (event.selection) {
            const [[x0, y0], [x1, y1]] = event.selection;
            // Filter to get points in the brush
            const brushedDataPoints = dataset.filter(d => {
                const dx = x(d.length);
                const dy = y(d.totalDegrees);
                return dx >= x0 && dx <= x1 && dy >= y0 && dy <= y1;
            });
            brushedPathIds = brushedDataPoints.map(d => d.id);
            onbrush(brushedDataPoints);
        } else {
            brushedPathIds = null;
            onbrush(dataset);
        }
    }
    
    const brush = $derived(
        d3.brush()
            .extent([
                [marginLeft, marginTop],
                [width - marginRight, height - marginBottom]
            ])
            .on('start brush end', brushed)
    );
    
    // Reset brush when path data changes
    $effect(() => {
        if (svg && paths) {
            d3.select(svg).call(brush).call(brush.clear);
        }
    });
</script>

<svg {width} {height} bind:this={svg}>
    <!-- Background -->
    <rect x={0} y={0} {width} {height} fill="white" />
    
    <!-- Circles for each path -->
    <g>
        {#each dataset as d (d.id)}
            <circle
                cx={x(d.length)}
                cy={y(d.totalDegrees)}
                fill={brushedPathIds === null || brushedPathIds.includes(d.id)
                    ? colorScale(d.type) 
                    : '#d3d3d3'}
                r={3}
                opacity={d.type === 'predicted' && d.correct === false ? 0.5 : 0.8}
                stroke={d.type === 'predicted' && d.correct === false ? '#e15759' : 'none'}
                stroke-width={1}
            />
        {/each}
        
        <!-- Highlight selected path -->
        {#if highlightedPath}
            {#each dataset.filter(d => JSON.stringify(d.path) === JSON.stringify(highlightedPath)) as highlighted}
                <circle
                    cx={x(highlighted.length)}
                    cy={y(highlighted.totalDegrees)}
                    fill={colorScale(highlighted.type)}
                    r={6}
                    stroke="black"
                    stroke-width={2}
                />
            {/each}
        {/if}
    </g>
    
    <!-- X-axis -->
    <g transform={`translate(0,${height - marginBottom})`}>
        <path 
            stroke="currentColor" 
            d={`M${marginLeft},0H${width - marginRight}`}
        />
        {#each x.ticks() as tick}
            <g transform={`translate(${x(tick)},0)`}>
                <line y2="6" stroke="currentColor" />
                <text y="9" dy="0.71em" text-anchor="middle">{tick}</text>
            </g>
        {/each}
        <text 
            x={width / 2} 
            y={40} 
            text-anchor="middle" 
            font-weight="bold"
        >
            Path Length
        </text>
    </g>
    
    <!-- Y-axis -->
    <g transform={`translate(${marginLeft},0)`}>
        <path 
            stroke="currentColor" 
            d={`M0,${marginTop}V${height - marginBottom}`}
        />
        {#each y.ticks() as tick}
            <g transform={`translate(0,${y(tick)})`}>
                <line x2="-6" stroke="currentColor" />
                <text x="-9" dy="0.32em" text-anchor="end">{tick}</text>
            </g>
        {/each}
        <text 
            transform={`translate(-40,${height / 2}) rotate(-90)`}
            text-anchor="middle" 
            font-weight="bold"
        >
            Total Node Degrees
        </text>
    </g>
    
    <!-- Legend -->
    <g transform={`translate(${width - marginRight - 120}, ${marginTop + 10})`}>
        {#each colorScale.domain() as type, i}
            <g transform={`translate(0, ${i * 20})`}>
                <circle r="6" fill={colorScale(type)} />
                <text x="10" y="4" style="font-size: 12px;">{type}</text>
            </g>
        {/each}
    </g>
</svg>

<style>
    circle {
        transition: 
            cx 250ms,
            cy 250ms,
            r 250ms,
            fill 250ms;
    }
</style>