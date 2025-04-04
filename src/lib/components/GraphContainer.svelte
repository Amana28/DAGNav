<script>
  // Props for customization 
  export let title = 'Graph Visualization';
</script>

<div class="graph-container">
  <div class="graph-header">
    <h2>{title}</h2>
  </div>
  <div class="graph-content">
    <slot>
      <!-- Default content if no graph is provided -->
      <p>Graph visualization will appear here</p>
    </slot>
  </div>
</div>

<style>
  .graph-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
    height: calc(100vh - 150px); /* Adjust based on your navbar height */
    overflow: auto;
  }

  .graph-header {
    /* border-bottom: 1px solid #e3e6e8; */
    margin-bottom: 16px;
    padding-bottom: 8px;
  }

  .graph-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
  }

  .graph-content {
    height: calc(100% - 60px);
    position: relative;
  }
</style> 