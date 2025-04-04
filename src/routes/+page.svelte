<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/Navbar.svelte';


    onMount(() => {
      // Your D3 visualization code here
      const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', 600)
        .attr('height', 400);
      
      // Add your D3 visualization elements
    });
</script>

<!-- Navbar component here -->
<Navbar />

<main>
<h1>My D3 Visualization</h1>
<div id="visualization"></div>
</main>

<style>
main {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
}
</style>