<script>
    let { paths = [], onhover = () => {} } = $props();
</script>


<div class="generated-paths-container">
    <div class="generated-paths-header">
      <h2>Generated Paths</h2>
    </div>
    <div class="generated-paths-content">
        <ul>
            {#each paths as path}
                <li
                    onmouseover={() => onhover(path)}
                    onmouseleave={() => onhover(null)}
                    onfocus={() => onhover(path)}
                    onfocusout={() => onhover(null)}
                >
                    {path.join(' ')}
                </li>
            {/each}
        </ul>
    </div>
</div>



<style>
    .generated-paths-container {
        height: 100%;
        width: 100%;
        /* make div no wider or taller than its parent */
        max-width: 100%;
        max-height: 100%;
        padding: 1em;
    }

    .generated-paths-header {
        margin-bottom: 1em;
        padding-bottom: 0.5em;
    }

    .generated-paths-header h2 {
        margin: 0;
        padding-left: 1em;
        font-size: 1.5rem;
        text-align: left;
        color: #2c3e50;
    }

    .generated-paths-content {
        height: 100%;
        width: 100%;
        background-color: white;
        border-radius: 8px;
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1), inset 0 -4px 6px rgba(0, 0, 0, 0.1);
        
        /* add scrolling */
        overflow: auto;
    }

    ul {
        padding: 2em;
        margin: 0;
        list-style-type: none;
    }

    /* add space between list items */
    li + li {
        margin-top: 0.5em;
    }

    /* set background color when hovering over list item */
    li:hover {
        background-color: #dddddd;
    }
</style>