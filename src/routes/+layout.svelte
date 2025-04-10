<script>
    import NavBar from '$lib/components/NavBar.svelte';
    import './style.css';
</script>



<div class="container">
    <div class="header">
        <NavBar />
    </div>
    <div class="main">
        <slot />
    </div>
</div>



<style>
    .container {
		font-size: 16px;
		/* make the div take up the entire screen */
		height: 100vh;
		width: 100vw;
		/* add 16px of padding around the div */
		padding: 1em;
		/* flex display for header and main */
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	/* header styling */
	.header {
		display: flex;
		gap: 2em;
        justify-content: flex-start;
        align-items: center;
	}

	.main {
		/* make this div take up the rest of the container */
		flex: 1;
		/* allow the div to shrink */
		min-height: 0;
		/* place the children next to each other */
		display: flex;
		/* add space between them */
        gap: 1em;
        margin-bottom: 3em;
	}
</style> 