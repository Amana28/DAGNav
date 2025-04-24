<!-- statistics-page/+page.svelte -->
<script>
    import PathList from '$lib/components/PathList.svelte';
    import VertexList from '$lib/components/VertexList.svelte';
    import PathStats from '$lib/components/PathStats.svelte';
    
    let { data } = $props();
        
    let graphmlData = data.graphmlData;
    
    // Max paths to display
    const maxPaths = 10000;
    let trainPaths = $state(data.trainPaths?.slice(0, maxPaths) || []);
    let testPaths = $state(data.testPaths?.slice(0, maxPaths) || []);
    let predictedPaths = $state(data.predictedPaths?.slice(0, maxPaths) || []);
    
    // Track current path type
    let currentPathType = $state('train');
    
    // Compute displayPaths based on currentPathType
    let displayPaths = $derived(
        currentPathType === 'train' ? trainPaths :
        currentPathType === 'test' ? testPaths :
        currentPathType === 'predicted' ? predictedPaths : 
        []
    );
 
    let hoveredPath = $state(null);
    let selectedVertex = $state(null);
    
    // Container dimensions for responsive layout
    let statsWidth = $state(0);
    let statsHeight = $state(0);
    
    function handlePathHover(path) {
        hoveredPath = path;
    }

    function handleVertexSelect(vertex) {
        selectedVertex = vertex;
    }

    // Handle path type changes
    function handlePathTypeChange(type) {
        currentPathType = type;
    }
    
</script>

<div class="main-container">
    <div class="vertex-list">
        <VertexList 
            paths={displayPaths}
            onSelect={handleVertexSelect}
        />
    </div>
    <div class="path-stats" bind:clientWidth={statsWidth} bind:clientHeight={statsHeight}>
        <PathStats 
            graphmlData={graphmlData}
            trainPaths={trainPaths}
            testPaths={testPaths}
            predictedPaths={predictedPaths}
            {currentPathType}
            selectedVertex={selectedVertex}
            width={statsWidth}
            height={statsHeight}
            hoveredPath={hoveredPath}
        />
    </div>
    <div class="path-list">
        <PathList 
            paths={displayPaths} 
            onhover={handlePathHover}
            {currentPathType}
            onPathTypeChange={handlePathTypeChange}
        />
    </div>
</div>


<style>
    .main-container {
        display: flex;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        overflow: hidden;
        box-sizing: border-box;
    }
    
    /* Apply 10-70-20 ratio */
    .vertex-list {
        flex: 0 0 10%;
        min-width: 150px; /* Smaller min-width for vertex list */
        max-width: 10%;
        height: 100%;
        box-sizing: border-box;
    }
    
    .path-stats {
        flex: 0 0 70%;
        max-width: 70%;
        height: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        box-sizing: border-box;
    }
    
    .path-list {
        flex: 0 0 20%;
        min-width: 200px;
        max-width: 20%;
        height: 100%;
        box-sizing: border-box;
    }
    
    /* Responsive layout for smaller screens */
    @media (max-width: 768px) {
        .main-container {
            flex-direction: column;
        }
        
        .vertex-list {
            flex: 0 0 auto;
            width: 100%;
            max-width: 100%;
            min-height: 200px;
            height: auto;
        }
        
        .path-stats {
            flex: 1;
            width: 100%;
            max-width: 100%;
            min-height: 400px;
        }
        
        .path-list {
            flex: 0 0 auto;
            width: 100%;
            max-width: 100%;
            min-height: 300px;
            height: auto;
        }
    }
</style>