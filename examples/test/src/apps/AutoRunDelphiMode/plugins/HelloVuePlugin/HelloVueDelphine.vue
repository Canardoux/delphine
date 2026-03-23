<script setup lang="ts">
import type { UIPluginMessage } from '@vcl'

const props = defineProps<{
        state: { message: string }
        services: { notify?: (msg: UIPluginMessage) => void }
        hostName: string
}>()

function changeMessage() {
        props.services.notify?.({
                type: 'setProp',
                hostName: props.hostName,
                key: 'message',
                value: 'Hello from VueJS!',
        })
}
</script>

<template>
        <div style="border: 1px solid #ccc; padding: 8px">
                <h2>VueJS</h2>
                👋 {{ props.state.message }}
                <button @click="changeMessage">Change message</button>
        </div>
</template>
