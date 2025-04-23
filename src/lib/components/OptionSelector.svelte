<!-- OptionSelector.svelte -->
<script>
    // Props
    let { 
        options = [], 
        activeOption = null, 
        onSelect = () => {},
        label = "Options" 
    } = $props();
    
    // State
    let showMenu = $state(false);
    
    // Toggle menu visibility
    function toggleMenu() {
        showMenu = !showMenu;
    }
    
    // Handle option selection
    function handleSelect(option) {
        onSelect(option);
        showMenu = false;
    }
    
    // Close menu when clicking outside
    function handleClickOutside(event) {
        if (showMenu && 
            !event.target.closest('.option-button') && 
            !event.target.closest('.option-menu')) {
            showMenu = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="option-select-container">
    <button class="option-button" onclick={toggleMenu} aria-label={label}>
        <span class="button-text">{label}</span>
    </button>
    
    {#if showMenu}
    <div class="option-menu">
        {#each options as option}
            <button 
                class:active={activeOption === option.value} 
                onclick={() => handleSelect(option.value)}
            >
                {option.label}
            </button>
        {/each}
    </div>
    {/if}
</div>

<style>
    .option-select-container {
        position: relative;
    }
    
    .option-button {
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
    
    .option-button:hover {
        background-color: #004da3;
        transform: scale(1.05);
    }
    
    .option-menu {
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
    
    .option-menu button {
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
    }
    
    .option-menu button:hover {
        background-color: #f0f2f5;
    }
    
    .option-menu button.active {
        background-color: #e6f0ff;
        color: #0062cc;
        font-weight: 500;
    }
</style>