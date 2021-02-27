<template>
  <div id="app">
    <Header />
    <main class="flex-center">
        <router-view/>
    </main>
    <Footer />
  </div>
</template>
<script>
import Header from './components/partials/Header.vue';
import Footer from './components/partials/Footer.vue';
export default {
  name: 'app',
  components: {
    Header,
    Footer
  }  
}
</script>
<style>
:root {
  --main-color: #ffd633;
}

html,
body {
  max-width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  display: flex;
  flex-direction: column;
  font-family: "Lato", sans-serif;
}

main {
  max-width: 100%;
  margin: 5% 0;
}

a {
  color: #000000;
}

p {
  margin: 0 5%;
  line-height: 140%;
}

h1, h2, h3 {
  color: #000000;
  text-align: center;
}

main p {
    color: #fff;
}

.flex-center {
  max-width: 100vw;
  display: flex;
  flex-flow: column wrap;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
}
</style>