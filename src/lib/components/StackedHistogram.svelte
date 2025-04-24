<!-- StackedHistogram.svelte -->
<script>
    import * as d3 from 'd3';
    
    // Props with default values
    let { 
        paths = [], 
        color = null,
        uniquePathLengths = null,
        width = 600, 
        height = 400,
        marginLeft = 60,
        marginTop = 30,
        marginRight = 30,
        marginBottom = 50
    } = $props();
    
    // If uniquePathLengths is not provided, calculate it
    const pathLengths = $derived(
        uniquePathLengths || Array.from(new Set(paths.map(path => path.length)))
    );
    
    // If color is not provided, create a default color scale
    const colorScale = $derived(
        color || d3.scaleOrdinal()
            .domain(pathLengths)
            .range(d3.schemeTableau10)
    );
    
    // Get the counts for the filtered dataset
    const counts = $derived(
        d3.rollup(
            paths,
            (g) => g.length,  // Count how many paths in each group
            (d) => d.length   // Group by the 'length' property
        )
    );
    
    // Convert to array for easier use in rendering
    const countArray = $derived(
        Array.from(counts, ([length, count]) => ({ length, count }))
            .sort((a, b) => a.length - b.length)
    );
    
    // Scales
    const maxCount = $derived(d3.max(counts.values()) || 0);
    
    // X axis represents path length categories (vertical bars)
    const x = $derived(
        d3
            .scaleBand()
            .domain(pathLengths)
            .range([marginLeft, width - marginRight])
            .padding(0.1)
    );
    
    // Y axis represents counts (heights of bars)
    const y = $derived(
        d3
            .scaleLinear()
            .domain([0, maxCount])
            .nice()
            .range([height - marginBottom, marginTop])
    );
</script>

<svg {width} {height}>
    <!-- Bars -->
    <g>
        {#each countArray as {length, count} (length)}
            <rect
                x={x(length)}
                y={y(count)}
                width={x.bandwidth()}
                height={(height - marginBottom) - y(count)}
                fill={colorScale(length)}
            />
            
            <!-- Add text labels for count -->
            <text
                x={x(length) + x.bandwidth() / 2}
                y={y(count) - 5}
                text-anchor="middle"
                font-size="12px"
                fill="#555"
            >
                {count}
            </text>
        {/each}
    </g>
    
    <!-- X Axis (Path Length) -->
    <g transform={`translate(0,${height - marginBottom})`}>
        <path stroke="currentColor" d={`M${marginLeft},0H${width - marginRight}`}></path>
        {#each pathLengths as length}
            <g transform={`translate(${x(length) + x.bandwidth() / 2},0)`}>
                <line stroke="currentColor" y2="6"></line>
                <text fill="currentColor" y="9" dy="0.71em" text-anchor="middle">{length}</text>
            </g>
        {/each}
        <text 
            fill="currentColor" 
            x={(width - marginRight + marginLeft) / 2} 
            y="40" 
            text-anchor="middle"
        >
            Path Length
        </text>
    </g>
    
    <!-- Y Axis (Count) -->
    <g transform={`translate(${marginLeft},0)`}>
        <path stroke="currentColor" d={`M0,${marginTop}V${height - marginBottom}`}></path>
        {#each y.ticks() as tick}
            <g transform={`translate(0,${y(tick)})`}>
                <line stroke="currentColor" x2="-6"></line>
                <text fill="currentColor" x="-9" dy="0.32em" text-anchor="end">{tick}</text>
            </g>
        {/each}
        <text 
            fill="currentColor" 
            transform={`translate(-40,${(height - marginBottom + marginTop) / 2}) rotate(-90)`} 
            text-anchor="middle"
        >
            Count
        </text>
    </g>
</svg>

<style>
    /* Animate changes to the heights of the bars */
    rect {
        transition: height 250ms, y 250ms;
    }
    
    text {
        font-family: sans-serif;
        font-size: 10px;
    }
</style>