<template>
    <div class="remote">
        <div class="arrows">
            <div class="invisible-cell"></div>
            <div class="arrow-up" v-on:click="sendKey('{UP}')">
                <i class="material-icons">keyboard_arrow_up</i>
            </div>
            <div class="invisible-cell"></div>
            <div class="arrow-left" v-on:click="sendKey('{LEFT}')">
                <i class="material-icons">keyboard_arrow_left</i>
            </div>
            <div class="ok-button" v-on:click="sendKey(' ')">
                <i class="material-icons">pause</i>
            </div>
            <div class="arrow-right" v-on:click="sendKey('{RIGHT}')">
                <i class="material-icons">keyboard_arrow_right</i>
            </div>
            <div class="invisible-cell"></div>
            <div class="arrow-down" v-on:click="sendKey('{DOWN}')">
                <i class="material-icons">keyboard_arrow_down</i>
            </div>
            <div class="invisible-cell"></div>
        </div>
        <div class="media-controls">
            <div class="media-previous" v-on:click="server.send('mediaPrevious')">
                <i class="material-icons">skip_previous</i>
            </div>
            <div class="media-playpause" v-on:click="server.send('mediaPlayPause')">
                <i class="material-icons">play_arrow</i>
            </div>
            <div class="media-next" v-on:click="server.send('mediaNext')">
                <i class="material-icons">skip_next</i>
            </div>
        </div>
        <div class="volume-slider">
            <div class="volume-status" v-on:click="toggleMute">
                <i class="material-icons" v-if="volume === 0">volume_off</i>
                <i class="material-icons" v-else-if="volume < 50">volume_down</i>
                <i class="material-icons" v-else>volume_up</i>
            </div>
            <div class="volume-progress-container"
                 v-on:touchmove="mouseMove"
                 v-on:mousemove="mouseMove"
                 v-on:touchstart="mouseDown"
                 v-on:mousedown="mouseDown"
                 v-on:touchend="mouseUp"
                 v-on:mouseup="mouseUp">

                <div class="volume-progress" v-bind:style="{ width: Math.round(volume) + '%' }"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import Socket from '../js/Socket.js';

    export default {
        name: 'RemotePage',
        props: {
            server: Socket
        },
        data() {
            return {
                volume: 0,
                interval: -1,
                lastSend: 0,
                mouseIsDown: false,
                lastTouch: undefined,
                volumeSendRate: 200,
                volumeRefreshRate: 250,
                prevPeak: 50,
            }
        },
        methods: {
            sendKey: async function (key) {
                await this.server.send('pressKey', key);
            },
            toggleMute: async function () {
                if (performance.now() - this.lastSend >= this.volumeSendRate) {
                    this.lastSend = performance.now();

                    let newVolume;
                    if (this.volume !== 0) {
                        newVolume = 0;
                        this.prevPeak = this.volume;
                    } else
                        newVolume = this.prevPeak;

                    await this.server.send("setVolume", newVolume);
                }
            },
            mouseUp: async function () {

                if (this.lastTouch) {
                    //Make sure volume bar doesnt update suddenly after releasing touch
                    let e = this.lastTouch;
                    if (e.touches)
                        e = e.touches[0];
                    let x = e.pageX - e.target.offsetLeft;
                    this.volume = Math.min(Math.max(x / e.target.offsetWidth, 0), 1) * 100;

                    //Send last touch movement data, in case last update wasn't sent due to rate limiter
                    setTimeout(() => {
                        this.mouseIsDown = false;
                        this.setVolumeByEvent(e)
                    }, this.volumeSendRate);
                    this.lastTouch = undefined;
                }
            },
            mouseDown: async function (e) {
                this.mouseIsDown = true;
                this.setVolumeByEvent(e);
            },
            mouseMove: async function (e) {
                this.lastTouch = e;
                if (this.mouseIsDown)
                    this.setVolumeByEvent(e);
            },
            setVolumeByEvent: async function (e) {
                let element = document.querySelector('.volume-progress');
                element.style.transition = '0s';

                if (e.touches)
                    e = e.touches[0];

                let x = e.pageX - e.target.offsetLeft;
                this.volume = Math.min(Math.max(x / e.target.offsetWidth, 0), 1) * 100;

                if (performance.now() - this.lastSend >= this.volumeSendRate) {
                    this.lastSend = performance.now();
                    await this.server.send("setVolume", Math.round(this.volume * 100) / 100);

                    element.style.transition = 'width 0.1s';
                    element.style.transitionTimingFunction = 'linear';
                }
            },
            updateVolume: async function () {
                this.volume = await this.server.send('getVolume');
                this.interval = setInterval(async () => {
                    if (this.mouseIsDown) return;

                    let vol = await this.server.send('getVolume');

                    if (this.mouseIsDown) return;
                    this.volume = vol;
                }, this.volumeRefreshRate);
            }
        },
        async mounted() {
            console.log("Remote mounted", this.server.ready);

            if (!this.server.ready)
                this.server.on('open', async () => this.updateVolume());
            else
                this.updateVolume();
        },
        beforeDestroy() {
            if (this.interval !== -1)
                clearInterval(this.interval);
        }
    }
</script>

<style scoped>
    .remote {
        position: fixed;
        bottom: 60px;
        width: 100%;
        padding: 40px 0;
    }

    .arrows {
        display: flex; /* establish flex container */
        flex-wrap: wrap; /* enable flex items to wrap */
        justify-content: space-around;
        width: 200px;
        height: 200px;
        margin: 0 auto;
    }

    .arrows > div {
        cursor: pointer;
        flex: 0 0 calc(100% / 3 - 10px); /* don't grow, don't shrink, width */
        height: calc(100% / 3 - 10px);
        margin: 5px;
        line-height: 72px;
        border-radius: 5px;
        color: rgba(255, 255, 255, 0.7);

        background-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.25);
        transition: 0.1s;
    }

    .arrows > div:active {
        transform: scale(1.2);
    }

    .arrows > div > * {
        pointer-events: none;
    }

    .invisible-cell {
        visibility: hidden;
    }

    .volume-slider {
        width: calc(100% - 20px);
        margin: 20px auto;
        height: 40px;
        max-width: 500px;
    }

    .volume-status {
        width: 40px;
        display: inline-block;
        height: 100%;
        cursor: pointer;
    }

    .volume-status > i {
        line-height: 40px;
        height: 100%;
        position: relative;
        top: -8px;
        pointer-events: none;
    }

    .volume-progress-container {
        width: calc(100% - 80px);
        margin-right: 40px;
        display: inline-block;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.25);
    }

    .volume-progress {
        border-radius: 5px;
        transition: width 0.1s;
        transition-timing-function: linear;
        background-color: #442fb7;
        height: 100%;
        pointer-events: none;
    }

    .media-controls {
        width: calc(100% - 20px);
        height: 50px;
        max-width: 500px;
        margin: 40px auto;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        color:rgba(255,255,255,0.8);
    }

    .media-controls > div {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor:pointer;
    }

    .media-controls>div:hover{
        background-color:rgba(255,255,255,0.15);
    }

    .media-controls>div>i{
        line-height:50px;
        height:100%;
        pointer-events:none;
    }
</style>
