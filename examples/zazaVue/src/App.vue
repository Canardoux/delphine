<script setup lang="ts">
import HelloDelphine from './components/HelloDelphine.vue'

const state = { message: 'Hello from Vue' }

const services = {}

const hostName = 'demo'
</script>

<template>
        <HelloDelphine :state="state" :services="services" :hostName="hostName" />
</template>
