<!-- PathList.svelte -->
<script>
    import OptionSelector from '$lib/components/OptionSelector.svelte';
    import SortSelector from '$lib/components/SortSelector.svelte';
	import { parsePaths } from '$lib/utils/pathUtils.js';
    import * as d3 from 'd3';
    
    // Define props with default values
    let { 
        paths = [], 
        onhover = () => {},
        currentPathType = 'train',
        onPathTypeChange = () => {} 
    } = $props();
    
    // Path options for the selector
    const pathTypeOptions = [
        { value: 'train', label: 'train' },
        { value: 'test', label: 'test' },
        { value: 'predicted', label: 'predicted' }
    ];
    
    // Make sure this function is correctly passing the type up to the parent
    function handlePathTypeChange(type) {
        onPathTypeChange(type);
    }

    // Sorting logic
    let selectedSorts = $state([]);
    
    // Define sort options based on path type using derived
    let sortOptions = $derived(
        currentPathType === 'predicted' 
        ? [
            { value: 'length+', label: 'Length ⬆︎' },
            { value: 'length-', label: 'Length ⬇︎' },
            { value: 's+', label: 'Start ⬆︎' },
            { value: 's-', label: 'Start ⬇︎' },
            { value: 't+', label: 'End ⬆︎' },
            { value: 't-', label: 'End ⬇︎' },
            { value: 'correct', label: 'Correct' },
            { value: 'incorrect', label: 'Incorrect' }
        ] 
        : [
            { value: 'length+', label: 'Length ⬆︎' },
            { value: 'length-', label: 'Length ⬇︎' },
            { value: 's+', label: 'Start ⬆︎' },
            { value: 's-', label: 'Start ⬇︎' },
            { value: 't+', label: 'End ⬆︎' },
            { value: 't-', label: 'End ⬇︎' }
        ]
    );
    
    // Apply D3 sorting to paths
    let sortedPaths = $derived(sortPathsWithD3(paths, selectedSorts));
    
    function sortPathsWithD3(pathsToSort, sortCriteria) {
        // Return original if no sort criteria
        if (!sortCriteria || sortCriteria.length === 0) {
            return pathsToSort;
        }
        
        // Create a new array to avoid mutating the original
        let sorted = [...pathsToSort];
        
        // D3 multi-level sorting
        sorted = d3.sort(sorted, (a, b) => {
            // Apply each sort criteria in sequence
            for (const sort of sortCriteria) {
                let accessor;
                let order = 1; // Default ascending
                
                switch (sort) {
                    case 'length+':
                        accessor = d => d.length;
                        break;
                    case 'length-':
                        accessor = d => d.length;
                        order = -1;
                        break;
                    case 's+':
                        accessor = d => d.start;
                        break;
                    case 's-':
                        accessor = d => d.start;
                        order = -1;
                        break;
                    case 't+':
                        accessor = d => d.end;
                        break;
                    case 't-':
                        accessor = d => d.end;
                        order = -1;
                        break;
                    case 'correct':
                        accessor = d => d.correct ? 1 : 0;
                        order = -1; // Put correct at top
                        break;
                    case 'incorrect':
                        accessor = d => d.correct ? 1 : 0;
                        // Default ascending puts incorrect at top
                        break;
                }
                
                // Apply this level of sorting
                const comparison = d3.ascending(accessor(a), accessor(b)) * order;
                
                // If this comparison yields a difference, return it
                if (comparison !== 0) return comparison;
            }
            
            // If all criteria are equal, maintain original order
            return 0;
        });
        
        return sorted;
    }
    
    // Handle sort changes
    function handleSortChange(newSorts) {
        selectedSorts = newSorts;
    }
</script>

<div class="path-list-container">
    <div class="path-list-header">
        <h2>[{currentPathType}] Paths [{paths.length}]</h2>
        
        <div class="control-buttons">
            <div class="sort-selector">
                <SortSelector
                    sortOptions={sortOptions}
                    selectedSorts={selectedSorts}
                    onSortChange={handleSortChange}
                    label="Sort"
                />
            </div>
            
            <div class="path-selector">
                <OptionSelector 
                    options={pathTypeOptions}
                    activeOption={currentPathType}
                    onSelect={handlePathTypeChange}
                    label="View"
                />
            </div>
        </div>
    </div>
    
    <div class="path-list-wrapper">
        <div class="path-list-content">
            <ul>
                {#each sortedPaths as pathObj}
                    <button 
                        class="path-list-item"
                        class:incorrect={pathObj.correct === false}
                        onmouseover={() => onhover(pathObj.path)}
                        onfocus={() => onhover(pathObj.path)}
                        onmouseout={() => onhover(null)}
                        onblur={() => onhover(null)}
                    >
                        <span class="path-list-text">{pathObj.path.join(' ')}</span>
                        {#if currentPathType === 'predicted' && pathObj.correct === false}
                            <span class="error-tag">{pathObj.errorType || 'error'}</span>
                        {/if}
                    </button>
                {/each}
            </ul>
        </div>
    </div>
</div>

<style>
    .path-list-container {
        height: 100%;
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        padding: 1em;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }
    
    .path-list-header {
        margin-bottom: 1em; /* Fixed margin */
        padding-bottom: 0.5em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 0 0 auto;
        height: 3em; /* Fixed height for the header */
    }
    
    .path-list-header h2 {
        margin: 0;
        padding-left: 1em;
        font-size: 1.5rem;
        text-align: left;
        color: #2c3e50;
    }
    
    .control-buttons {
        display: flex;
        gap: 1em;
    }
    
    .path-list-wrapper {
        flex: 1;
        display: flex;
        width: 100%;
        overflow: hidden;
        position: relative;
    }
    
    .path-list-content {
        flex: 1;
        width: 100%;
        background-color: white;
        border-radius: 8px;
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1), inset 0 -4px 6px rgba(0, 0, 0, 0.1);
        overflow: auto;
    }
    
    ul {
        padding: 2em;
        margin: 0;
        list-style-type: none;
    }
    
    .path-list-item {
        display: flex;
        justify-content: space-between;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        padding: 0.5em;
        margin-top: 0.5em;
        font-family: inherit;
        font-size: inherit;
        cursor: pointer;
        border-radius: 4px;
    }
    
    .path-list-item:hover, .path-list-item:focus {
        background-color: #dddddd;
        outline: none;
    }
    
    .path-list-item.incorrect {
        border-left: 3px solid #e74c3c;
        padding-left: 0.75em;
    }
    
    .path-list-text {
        flex: 1;
    }
    
    .error-tag {
        font-size: 0.8em;
        background-color: #e74c3c;
        color: white;
        padding: 0.1em 0.4em;
        border-radius: 3px;
        margin-left: 0.5em;
    }
</style>