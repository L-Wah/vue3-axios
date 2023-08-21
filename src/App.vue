<template>
  <img alt="Vue logo" src="./assets/logo.png" @click="click" />
  <button @click="btn">点击</button>
</template>

<script setup>
import { rankInfo, dayRankInfo, pagingHonor } from './api/index';
rankInfo();
dayRankInfo();
let params = {
  pageNum: 1,
  pageSize: 100,
};
pagingHonor(params);
const click = async () => {
  try {
    await pagingHonor(params);
  } catch (error) {
    console.log(error);
  }
};

const btn = () => {
  pagingHonor({
    cancel_http: true,
  });
};
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
