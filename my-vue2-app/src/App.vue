<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <RtcPlayer />
  </div>
</template>

<script>
import RtcPlayer from './components/RtcPlayer';

export default {
  name: 'App',
  components: {
    RtcPlayer
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
