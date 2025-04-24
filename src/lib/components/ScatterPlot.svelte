<script>
    import * as d3 from 'd3';
    let {
        paths = [],
        width = 600,
        height = 400,
        marginLeft = 50,
        marginTop = 20,
        marginRight = 20,
        marginBottom = 50,
        highlightedPath = null,
        xJitterRange = 0.4,
        yJitterRange = 0.02
    } = $props();
    
    const dataset = $derived(
        paths.map(path => {
            const xFeature = path.length;
            let yFeature;
            if (path.correct) {
                yFeature = path.sumDegrees / path.length;
            } else {
                const divisor = path.errorIndexStart ? path.errorIndexStart - 1 : path.length;
                yFeature = path.sumDegrees / (divisor || 1);
            }
            return { ...path, xFeature, yFeature };
        })
    );
    
    const x = $derived(
        d3.scaleLinear()
          .domain([0, d3.max(dataset, d => d.xFeature) || 10])
          .nice()
          .range([marginLeft, width - marginRight])
    );
    
    const y = $derived(
        d3.scaleLinear()
          .domain([0, d3.max(dataset, d => d.yFeature) * 1.1 || 5])
          .nice()
          .range([height - marginBottom, marginTop])
    );
    
    function getColor(d) {
        if (d.type === 'train' || d.type === 'test') {
            return "#888888";
        } else {
            return d.correct ? "#4CAF50" : "#E53935";
        }
    }
    
    function getXJitter() {
        return (Math.random() - 0.5) * 2 * xJitterRange;
    }
    function getYJitter(yValue) {
        return (Math.random() - 0.5) * 2 * yJitterRange * yValue;
    }

    const predicted_REFERENCE = 5;
    const train_test_REFERENCE = 6;
</script>

<svg {height} {width}>
    <g class="reference-lines">
        <line 
            x1={marginLeft}
            y1={y(predicted_REFERENCE)}
            x2={width - marginRight}
            y2={y(predicted_REFERENCE)}
            stroke="#87CEEB"
            stroke-width="2"
            stroke-dasharray="8,4"
            opacity="0.7"
        />
        <text 
            x={width - marginRight + 5}
            y={y(predicted_REFERENCE)}
            dy="0.32em"
            font-size="12px"
            fill="#87CEEB"
        >
            y=5
        </text>
        <line 
            x1={marginLeft}
            y1={y(train_test_REFERENCE)}
            x2={width - marginRight}
            y2={y(train_test_REFERENCE)}
            stroke="#888888"
            stroke-width="2"
            stroke-dasharray="8,4"
            opacity="0.7"
        />
        <text 
            x={width - marginRight + 5}
            y={y(train_test_REFERENCE)}
            dy="0.32em"
            font-size="12px"
            fill="#888888"
        >
            y=6
        </text>
    </g>

    <g>
        {#each dataset as d}
        <circle
            cx={x(d.xFeature + getXJitter())}
            cy={y(d.yFeature + getYJitter(d.yFeature))}
            r={d.type === 'predicted' && !d.correct ? 3.5 : 3} 
            fill={getColor(d)}
            opacity={d.type === 'predicted' && !d.correct ? 0.7 : 0.1} 
        />
        {/each}

        {#if highlightedPath}
        {#each dataset.filter(d => d.path.toString() === highlightedPath.toString()) as d}
            <circle
                cx={x(d.xFeature)}
                cy={y(d.yFeature)}
                r={6}
                fill={getColor(d)}
                stroke="black"
                stroke-width={2}
            />
        {/each}
        {/if}
    </g>

    <!-- X-axis -->
    <g transform={`translate(0,${height - marginBottom})`}>
        <path stroke="currentColor" stroke-width="1.5" d={`M${marginLeft},0H${width - marginRight}`}></path>
        {#each x.ticks() as tick}
            <g transform={`translate(${x(tick)},0)`}>
                <line stroke="currentColor" stroke-width="1.5" y2="6"></line>
                <text 
                    fill="currentColor" 
                    y="9" 
                    dy="0.71em" 
                    text-anchor="middle"
                    font-size="12px"
                >
                    {tick}
                </text>
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

    <!-- Y-axis -->
    <g transform={`translate(${marginLeft},0)`}>
        <path stroke="currentColor" stroke-width="1.5" d={`M0,${marginTop}V${height - marginBottom}`}></path>
        {#each y.ticks() as tick}
            <g transform={`translate(0,${y(tick)})`}>
                <line stroke="currentColor" stroke-width="1.5" x2="-6"></line>
                <text 
                    fill="currentColor" 
                    x="-9" 
                    dy="0.32em" 
                    text-anchor="end"
                    font-size="12px"
                >
                    {tick.toFixed(1)}
                </text>
            </g>
        {/each}
        <text 
            fill="currentColor" 
            transform={`translate(-40,${(height - marginBottom + marginTop) / 2}) rotate(-90)`} 
            text-anchor="middle"
            font-size="14px"
            font-weight="bold"
        >
            Average Degree
        </text>
    </g>
</svg>

<style>
    circle {
        transition: r 250ms, fill 250ms;
    }
</style>
