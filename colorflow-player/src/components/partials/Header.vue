<template>
    <header>
        <h1>
            <a href="/">Colorflow Player</a>
        </h1>
        <nav role="navigation">
            <ul>
                <li><a href="/spotify">Spotify</a></li>
                <li><a href="/apple-music">Apple Music</a></li>
            </ul>
        </nav>
    </header>
</template>
<script>
export default {
    name: 'Header'
}
</script>
<style scoped>
    header {
        width: 100%;
        background: var(--main-color);
        padding-bottom: 2.5%;
    }
    
    h1 {
        margin-top: 0;
        padding: 2.5% 0;
    }
    
    nav ul {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      list-style-type: none;
    }
    nav a {
        font-weight: bold;
    }
</style>