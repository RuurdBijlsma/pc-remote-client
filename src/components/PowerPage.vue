<template>
    <div class="power">
        <div class="power-buttons">
            <div v-on:click="server.send('shutdown')">
                <i class="material-icons">power_settings_new</i>
                <a>Shut down</a>
            </div>
            <div v-on:click="server.send('restart')">
                <i class="material-icons">autorenew</i>
                <a>Restart</a>
            </div>
            <div v-on:click="server.send('sleep')">
                <i class="material-icons">hotel</i>
                <a>Sleep</a>
            </div>
        </div>
    </div>
</template>

<script>
    import Socket from '../js/Socket.js';

    export default {
        name: 'PowerPage',
        props: {
            server: Socket
        }
    }
</script>

<style scoped>
    .power {
        height: 100%;
    }

    .power-buttons {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-evenly;
    }

    .power-buttons > div {
        cursor: pointer;
        border-radius: 50%;
        height: 140px;
        width: 140px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        box-shadow: 0 0 5px 0 rgba(255, 255, 255, 0.3);
        margin: 0 auto;
    }

    .power-buttons > div:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .power-buttons > div > * {
        pointer-events: none;
    }
</style>
