<template>
  <img alt="Vue logo" src="./assets/logo.png">
</template>

<script setup>
import { rankInfo, dayRankInfo, pagingHonor } from "./api/index";
rankInfo();
dayRankInfo();
let params = {
  pageNum: 1,
  pageSize: 10,
};
pagingHonor(params);
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
