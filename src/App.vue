<template>
    <div id="app">
        <div class="pages">
            <remote-page v-bind:server="server" v-if="page===0"/>
            <input-page v-bind:server="server" v-else-if="page===1"/>
            <power-page v-bind:server="server" v-else/>
        </div>
        <div class="bottom-bar">
            <div v-bind:active="page===0" v-on:click="page=0">
                <i class="material-icons">settings_remote</i>
                <a v-if="page===0">Remote</a>
            </div>
            <div v-bind:active="page===1" v-on:click="page=1">
                <i class="material-icons">mouse</i>
                <a v-if="page===1">Input</a>
            </div>
            <div v-bind:active="page===2" v-on:click="page=2">
                <i class="material-icons">power_settings_new</i>
                <a v-if="page===2">Power</a>
            </div>
        </div>
    </div>
</template>

<script>
    import Socket from './js/Socket.js';
    import InputPage from './components/InputPage.vue';
    import PowerPage from "./components/PowerPage";
    import RemotePage from "./components/RemotePage";
    import Swal from 'sweetalert2';

    let server=new Socket();

    export default {
        name: 'app',
        components: {
            RemotePage,
            PowerPage,
            InputPage,
        },
        data() {
            return {
                page: 0,
                server
            }
        },
        async mounted() {
            let ip;
            if (localStorage.getItem('ip') === null) {
                const {value: ipAddress} = await Swal.fire({
                    title: 'Enter your server IP address',
                    input: 'text',
                    inputValidator: (value) => {
                        return !value && 'You need to write something!'
                    }
                });
                ip = ipAddress;
                localStorage.ip = ipAddress;
            }else{
                ip = localStorage.ip;
            }
            server.connect('ws://' + ip + ':8005');
            console.log(server);
            server.on('open', async () => {
                await this.debugSend('ping');
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
    * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -o-user-select: none;
        user-select: none;
    }

    html, body {
        margin: 0;
        height: 100%;
        overflow-y: hidden;
    }

    #app {
        font-family: 'Montserrat', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        height: 100%;
        background: linear-gradient(to top, #150321 0%, #0c0a19 100%);

        display: flex;
        flex-direction: column;
        color: rgba(255, 255, 255, 0.9);
    }

    .pages {
        height: calc(100% - 70px);
        /*background-color: rgba(255, 255, 255, 0.1);*/
    }

    .bottom-bar {
        height: 70px;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        background-color: rgb(68, 47, 183);
        color: rgba(255, 255, 255, 0.4);
    }

    .bottom-bar > div {
        width: 70px;
        height: 70px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        cursor: pointer;
        border-radius: 50%;
        font-size: 12px;
    }

    .bottom-bar > div[active] {
        color: rgba(255, 255, 255, 0.9);
    }

    .bottom-bar > div > * {
        pointer-events: none;
    }
</style>
