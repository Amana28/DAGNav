<script>
  // Navigation items
  const navItems = [
    { text: 'Graph View', href: '#', active: true },
    { text: 'Matrices', href: '#' },
    { text: 'Errors', href: '#' },

  ];
</script>

<nav class="navbar">
  <div class="nav-container">
    <ul class="nav-items">
      {#each navItems as item}
        <li>
          <a 
            href={item.href} 
            class:active={item.active}
          >
            {item.text}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .navbar {
    width: 100%;
    background-color: white;
    /* border-bottom: 1px solid #e3e6e8; */
    padding: 8px 0;
    margin-top: 20px;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .nav-items {
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 16px;
  }

  a {
    text-decoration: none;
    color: #6a737c;
    font-size: 16px;
    padding: 6px 12px;
    border-radius: 20px;
    transition: all 0.2s ease;
  }

  a:hover {
    background-color: #f8f9f9;
    color: #3b4045;
  }

  .active {
    background-color: #0062cc;
    color: white;
  }

  .active:hover {
    background-color: #004da3;
    color: white;
  }
</style>
