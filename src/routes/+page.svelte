<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import GraphContainer from '$lib/components/GraphContainer.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';

    onMount(() => {
      // Your D3 visualization code here
      const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
      
      // Add your D3 visualization elements
    });
</script>

<Navbar />

<main>
    <div class="layout">
        <div class="graph-section">
            <GraphContainer>
                <div id="visualization"></div>
            </GraphContainer>
        </div>
        <div class="sidebar-section">
            <Sidebar />
        </div>
    </div>
</main>

<style>
    main {
        padding: 1rem;
        max-width: 1700px;
        margin: 0 auto;
    }

    .layout {
        display: flex;
        gap: 24px;
        margin-top: 16px;
    }

    .graph-section {
        flex: 0 0 70%;
        min-width: 0; /* Prevents flex item from overflowing */
    }

    .sidebar-section {
        flex: 0 0 30%;
    }

    #visualization {
        width: 100%;
        height: 100%;
    }
</style>