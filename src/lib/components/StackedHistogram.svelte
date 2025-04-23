<!-- StackedHistogram.svelte -->
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
        marginBottom = 60
    } = $props();
    
    // Process data to create histogram bins by length for each type
    const histogramData = $derived(processHistogramData(paths));
    
    function processHistogramData(pathsData) {
        // Get unique path lengths
        const lengths = [...new Set(pathsData.map(p => p.length))].sort((a, b) => a - b);
        
        // Get unique path types
        const types = [...new Set(pathsData.map(p => p.type))];
        
        // Create empty result structure
        const result = lengths.map(length => {
            const entry = { length };
            types.forEach(type => {
                entry[type] = 0;
            });
            return entry;
        });
        
        // Count paths by length and type
        pathsData.forEach(path => {
            const entry = result.find(r => r.length === path.length);
            if (entry) {
                entry[path.type] = (entry[path.type] || 0) + 1;
            }
        });
        
        return result;
    }
    
    // Scale for x-axis (path lengths)
    const x = $derived(
        d3.scaleBand()
            .domain(histogramData.map(d => d.length))
            .range([marginLeft, width - marginRight])
            .padding(0.1)
    );
    
    // Calculate maximum count for any length
    const maxCount = $derived(
        d3.max(histogramData, d => {
            let sum = 0;
            Object.keys(d).forEach(key => {
                if (key !== 'length') {
                    sum += d[key];
                }
            });
            return sum;
        })
    );
    
    // Scale for y-axis (counts)
    const y = $derived(
        d3.scaleLinear()
            .domain([0, maxCount || 10])
            .nice()
            .range([height - marginBottom, marginTop])
    );
    
    // Color scale for path types
    const colorScale = $derived(
        d3.scaleOrdinal()
            .domain(['train', 'test', 'predicted'])
            .range(['#4e79a7', '#f28e2c', '#e15759'])
    );
    
    // Stack generator
    const stack = $derived(
        d3.stack()
            .keys(colorScale.domain())
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)
    );
    
    // Generate the stacked data
    const stackedData = $derived(stack(histogramData));
</script>

<svg {width} {height}>
    <!-- Background -->
    <rect x={0} y={0} {width} {height} fill="white" />
    
    <!-- Stacked bars -->
    {#each stackedData as layer}
        <g fill={colorScale(layer.key)}>
            {#each layer as bar}
                <rect
                    x={x(bar.data.length)}
                    y={y(bar[1])}
                    height={y(bar[0]) - y(bar[1])}
                    width={x.bandwidth()}
                />
            {/each}
        </g>
    {/each}
    
    <!-- X-axis -->
    <g transform={`translate(0,${height - marginBottom})`}>
        <path 
            stroke="currentColor" 
            d={`M${marginLeft},0H${width - marginRight}`}
        />
        {#each histogramData as d}
            <g transform={`translate(${x(d.length) + x.bandwidth()/2},0)`}>
                <line y2="6" stroke="currentColor" />
                <text y="9" dy="0.71em" text-anchor="middle">{d.length}</text>
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
            Count
        </text>
    </g>
    
    <!-- Legend -->
    <g transform={`translate(${width - marginRight - 120}, ${marginTop + 10})`}>
        {#each colorScale.domain() as type, i}
            <g transform={`translate(0, ${i * 20})`}>
                <rect width="12" height="12" fill={colorScale(type)} />
                <text x="16" y="9" style="font-size: 12px;">{type}</text>
            </g>
        {/each}
    </g>
    
    <!-- Floating labels (for bars with enough height) -->
    {#each stackedData as layer}
        {#each layer as bar}
            {#if (y(bar[0]) - y(bar[1])) > 20 && bar.data[layer.key] >= 5}
                <text
                    x={x(bar.data.length) + x.bandwidth()/2}
                    y={(y(bar[0]) + y(bar[1])) / 2}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    fill="white"
                    font-weight="bold"
                >
                    {bar.data[layer.key]}
                </text>
            {/if}
        {/each}
    {/each}
</svg>

<style>
    rect {
        transition: 
            height 250ms,
            y 250ms,
            width 250ms;
    }
</style>