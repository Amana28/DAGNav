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
    let trainPaths = data.trainPaths;

    // // Debug information
    // console.log('Train paths type:', Array.isArray(trainPaths) ? 'Array' : typeof trainPaths);
    // console.log('Train paths length:', trainPaths?.length);

    // Only display the first 1000 paths for now
    const displayPaths = trainPaths?.slice(0, 1000) || [];

 
    let hoveredPath = $state(null);
    

    function handlePathHover(path) {
        hoveredPath = path;
    }
    

</script>


<div class="graph-view">
    <GraphView {graphmlData} highlightedPath={hoveredPath} />
    <!-- <MatrixView /> -->
</div>
<div class="path-list">
    <PathList paths={displayPaths} onhover={handlePathHover} />
</div>


<style>
    .graph-view {
        flex: 1 1 70%;
    }
    .path-list {
        flex: 0 0 30%;
    }
</style>