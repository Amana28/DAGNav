<!-- SortSelector.svelte -->
<script>
    // Props
    let { 
        sortOptions = [], 
        selectedSorts = [], 
        onSortChange = () => {},
        label = "Sort" 
    } = $props();
    
    // State
    let showMenu = $state(false);
    
    // Toggle menu visibility
    function toggleMenu() {
        showMenu = !showMenu;
    }
    
    // Handle sort selection/deselection
    function toggleSort(sortValue) {
        let newSorts;
        
        if (selectedSorts.includes(sortValue)) {
            // Remove the sort if already selected
            newSorts = selectedSorts.filter(s => s !== sortValue);
        } else {
            // Add the sort if not selected
            newSorts = [...selectedSorts, sortValue];
        }
        
        onSortChange(newSorts);
    }
    
    // Close menu when clicking outside
    function handleClickOutside(event) {
        if (showMenu && 
            !event.target.closest('.sort-button') && 
            !event.target.closest('.sort-menu')) {
            showMenu = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="sort-select-container">
    <button class="sort-button" onclick={toggleMenu} aria-label={label}>
        <span class="button-text">{label}</span>
    </button>
    
    {#if showMenu}
    <div class="sort-menu">
        {#each sortOptions as option}
            <button 
                class="sort-option"
                class:active={selectedSorts.includes(option.value)} 
                onclick={() => toggleSort(option.value)}
            >
                {option.label}
                {#if selectedSorts.includes(option.value)}
                    <span class="checkmark">✓</span>
                {/if}
            </button>
        {/each}
    </div>
    {/if}
</div>

<style>
    .sort-select-container {
        position: relative;
    }
    
    .sort-button {
        min-width: 40px;
        height: 40px;
        border-radius: 20px;
        background-color: #0062cc;
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
        padding: 0 15px;
    }
    
    .button-text {
        font-size: 14px;
        font-weight: 500;
    }
    
    .sort-button:hover {
        background-color: #004da3;
        transform: scale(1.05);
    }
    
    .sort-menu {
        position: absolute;
        top: 50px;
        right: 0;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        min-width: 150px;
        z-index: 100;
    }
    
    .sort-option {
        background-color: transparent;
        border: none;
        padding: 0.75em 1em;
        text-align: left;
        border-radius: 4px;
        margin: 0.25em 0;
        font-size: 0.875rem;
        color: #2c3e50;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .sort-option:hover {
        background-color: #f0f2f5;
    }
    
    .sort-option.active {
        background-color: #e6f0ff;
        color: #0062cc;
        font-weight: 500;
    }
    
    .checkmark {
        margin-left: 8px;
    }
</style>