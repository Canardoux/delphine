<script setup lang="ts">
import type { UIPluginMessage } from '@vcl';

const props = defineProps<{
        state: { message: string };
        services: { notify?: (msg: UIPluginMessage) => void };
        hostName: string;
}>();

function changeMessage() {
        props.services.notify?.({
                type: 'setProp',
                hostName: props.hostName,
                key: 'message',
                value: 'Hello from VueJS!'
        });
}
</script>

<template>
        <div style="border: 1px solid #ccc; padding: 8px">
                <h2>VueJS</h2>
                👋 {{ props.state.message }}
                <button @click="changeMessage">Change message</button>
        </div>
        <button data-delphine-component="TButton" data-delphine-caption="Delphine PLUGINxxx" data-delphine-name="delphine-plugin-button" data-delphine-onclick="delphineplugin_onclick">Delphine PLUGINxxx!</button>
</template>
