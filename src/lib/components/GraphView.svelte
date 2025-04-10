<script>
</script>


<div class="graph-view-container">
    <div class="graph-view-header">
      <h2>Graph View</h2>
    </div>
    <div class="graph-view-content">
    </div>
</div>


<style>
    .graph-view-container {
        height: 100%;
        width: 100%;
        /* make div no wider or taller than its parent */
        max-width: 100%;
        max-height: 100%;
        padding: 1em;
    }

    .graph-view-header {
        margin-bottom: 1em;
        padding-bottom: 0.5em;
    }

    .graph-view-header h2 {
        margin: 0;
        padding-left: 1em;
        
        font-size: 1.5rem;
        text-align: left;
        color: #2c3e50;
    }

    .graph-view-content {
        height: 100%;
        width: 100%;
        background-color: white;
        border-radius: 8px;
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1), inset 0 -4px 6px rgba(0, 0, 0, 0.1);

        /* add scrolling */
        overflow: auto;
    }

</style> 