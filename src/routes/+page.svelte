<!-- +page.svelte -->
<script>
    import './style.css';
    import * as d3 from 'd3';
    import NavBar from '$lib/components/NavBar.svelte';
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


    // console.log('Data loaded:', {
    //     trainPaths: trainPaths.length,
    //     testPaths: testPaths.length, 
    //     predictedPaths: predictedPaths.length
    // });
        
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
        // console.log('Page: changing path type to', type);
        currentPathType = type;
    }

</script>

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

<style>
    .graph-view {
        flex: 1 1 70%;
    }
    .path-list {
        flex: 0 0 30%;
    }
</style>