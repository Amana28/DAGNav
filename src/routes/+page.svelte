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

    // Only display the first 100 paths to prevent performance issues
    const displayPaths = trainPaths?.slice(0, 1000) || [];
    

</script>


<div class="graph-view">
    <GraphView {graphmlData} />
    <!-- <MatrixView /> -->
</div>
<div class="path-list">
    <PathList paths={displayPaths} />
</div>


<style>
    .graph-view {
        flex: 1 1 70%;
    }
    .path-list {
        flex: 0 0 30%;
    }
</style>