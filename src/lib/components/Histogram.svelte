<!-- Histogram.svelte -->
<script>
    import * as d3 from 'd3';
    
    // Props with default values
    let { 
        paths, 
        color,
        uniquePathLengths,
        width, 
        height,
        marginLeft,
        marginTop,
        marginRight,
        marginBottom
    } = $props();
    
    // If uniquePathLengths is not provided, calculate it
    const pathLengths = $derived(
        (uniquePathLengths || Array.from(new Set(paths.map(path => path.length))))
        .sort((a, b) => a - b)
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
        Array.from(counts, ([length, count]) => ({ 
            length, 
            count,
            percentage: (count / paths.length) * 100
        }))
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
    
    // Y axis represents percentages (heights of bars)
    const y = $derived(
        d3
            .scaleLinear()
            .domain([0, Math.min(100, Math.ceil(d3.max(countArray, d => d.percentage) * 1.1 || 0))])
            .nice()
            .range([height - marginBottom, marginTop])
    );
    
    // Are we viewing predicted paths?
    const ispredicted = $derived(() => 
        paths && paths.length > 0 && paths[0]?.type === 'predicted'
    );
</script>

<svg {width} {height}>
    <!-- Bars -->
    <g>
        {#each countArray as {length, count, percentage} (length)}
            <rect
                x={x(length)}
                y={y(percentage)}
                width={x.bandwidth()}
                height={(height - marginBottom) - y(percentage)}
                fill={ispredicted ? "#87CEEB" : "#87CEEB"} 
            />
            
            <!-- Add text labels with percentage -->
            <text
                x={x(length) + x.bandwidth() / 2}
                y={y(percentage) - 5}
                text-anchor="middle"
                font-size="12px"
                fill="#555"
            >
                {percentage.toFixed(1)}%
            </text>
        {/each}
    </g>
    
    <!-- X Axis (Path Length) -->
    <g transform={`translate(0,${height - marginBottom})`}>
        <path stroke="currentColor" stroke-width="1.5" d={`M${marginLeft},0H${width - marginRight}`}></path>
        {#each pathLengths as length}
            <g transform={`translate(${x(length) + x.bandwidth() / 2},0)`}>
                <line stroke="currentColor" stroke-width="1.5" y2="6"></line>
                <text fill="currentColor" y="9" dy="0.71em" text-anchor="middle" font-size="12px">{length}</text>
            </g>
        {/each}
        <text 
            fill="currentColor" 
            x={(width - marginRight + marginLeft) / 2} 
            y="40" 
            text-anchor="middle"
            font-size="14px"
            font-weight="bold"
        >
            Path Length
        </text>
    </g>
    
    <!-- Y Axis (Percentage) -->
    <g transform={`translate(${marginLeft},0)`}>
        <path stroke="currentColor" stroke-width="1.5" d={`M0,${marginTop}V${height - marginBottom}`}></path>
        {#each y.ticks() as tick}
            <g transform={`translate(0,${y(tick)})`}>
                <line stroke="currentColor" stroke-width="1.5" x2="-6"></line>
                <text fill="currentColor" x="-9" dy="0.32em" text-anchor="end" font-size="12px">{tick}%</text>
            </g>
        {/each}
        <text 
            fill="currentColor" 
            transform={`translate(-40,${(height - marginBottom + marginTop) / 2}) rotate(-90)`} 
            text-anchor="middle"
            font-size="14px"
            font-weight="bold"
        >
            Percentage
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
    }
</style>