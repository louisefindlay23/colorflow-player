<template>
    <footer>
        <p>© 2020 Spotify Colorflow</p>
    </footer>
</template>
<script>
export default {
    name: 'Footer'
}
</script>
<style scoped>
    footer {
        width: 100%;
        background: var(--main-color);
        padding: 1% 0;
        flex-shrink: 0;
    }
    
    footer p {
        font-weight: bold;
        text-align: center;
    }
</style>