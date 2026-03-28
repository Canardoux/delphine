<script lang="ts">
        export let message: string;
        export let count: number;
        export let enabled: boolean;

        export let services: {
                notify?: (msg: any) => void;
        };

        export let hostName: string;

        $: console.log('Svelte props changed', { message, count, enabled });

        function changeMessage() {
                services.notify?.({
                        type: 'setProp',
                        hostName,
                        key: 'message',
                        value: 'Hello from Svelte!'
                });
        }

        function incrementCount() {
                services.notify?.({
                        type: 'setProp',
                        hostName,
                        key: 'count',
                        value: (count ?? 0) + 1
                });
        }
</script>

<div style="border: 1px solid #ccc; padding: 8px;">
        <h2>Svelte</h2>
        <div>Message: {message}</div>
        <div>Count: {count}</div>

        <button on:click|stopPropagation={changeMessage} disabled={!enabled}>
                Change message
        </button>

        <button on:click|stopPropagation={incrementCount} disabled={!enabled}>
                Increment count
        </button>
</div>
