<script>
    import './style.css';
    import * as d3 from 'd3';
    import NavBar from '$lib/components/NavBar.svelte';
    import GraphView from '$lib/components/GraphView.svelte';
    import MatrixView from '$lib/components/MatrixView.svelte';
    import GeneratedPaths from '$lib/components/GeneratedPaths.svelte';
</script>


<div class="graph-visualization">
    <GraphView />
    <!-- <MatrixView /> -->
</div>
<div class="generated-paths">
    <GeneratedPaths />
</div>


<style>
    .graph-visualization {
        flex: 1 1 70%;
    }
    .generated-paths {
        flex: 0 0 30%;
    }
</style>