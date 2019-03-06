<template>
    <div id="app">
        {{volume}}
    </div>
</template>

<script>
    import Socket from './js/Socket.js';

    const server = new Socket('ws://localhost:8005');
    console.log(server);

    export default {
        name: 'app',
        data() {
            return{
                volume:0
            }
        },
        components: {

        },
        mounted() {
            server.on('open', async () => {
                await this.debugSend('ping');

                setInterval(async ()=>{
                    this.volume = await server.send('getVolume');
                }, 50);

                // console.log(await this.debugSend('getProcesses'));
            });
        },
        methods: {
            async debugSend(action, value = '') {
                let now = performance.now();
                let response = await server.send(action, value);
                console.log({responseTime: performance.now() - now, response});
            }
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
