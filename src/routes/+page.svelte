<!-- src/routes/statistics-page/+page.svelte -->
<script>
    import './style.css';
    import GraphView from '$lib/components/GraphView.svelte';
    import MatrixView from '$lib/components/MatrixView.svelte';
    import PathList from '$lib/components/PathList.svelte';
    
    let { data } = $props();
    
    let graphmlData = data.graphmlData;
    
    // Make path variables reactive with $state
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
    
    function handlePathHover(path) {
        hoveredPath = path;
    }

    // Handle path type changes
    function handlePathTypeChange(type) {
        currentPathType = type;
    }
</script>

<div class="main-container">
    <div class="graph-view">
        <GraphView {graphmlData} highlightedPath={hoveredPath} />
    </div>
    <div class="path-list">
        <PathList 
            paths={displayPaths} 
            onhover={handlePathHover}
            currentPathType={currentPathType}
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
    
    .graph-view {
        flex: 1;
        height: 100%;
        min-width: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }
    
    .path-list {
        flex: 0 0 30%;
        max-width: 30%;
        min-width: 250px;
        height: 100%;
        box-sizing: border-box;
    }
    
    /* Responsive layout for smaller screens */
    @media (max-width: 768px) {
        .main-container {
            flex-direction: column;
        }
        
        .graph-view {
            flex: 1;
            width: 100%;
            min-height: 300px;
        }
        
        .path-list {
            flex: 0 0 300px;
            width: 100%;
            max-width: 100%;
            height: 300px;
        }
    }
</style>