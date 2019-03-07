<template>
    <div class="input">
        <canvas class="trackpad"
                v-on:click="touchClick"
                v-on:touchmove="touchMove"
                v-on:touchstart="touchStart"
                v-on:touchend="touchEnd"></canvas>
    </div>
</template>

<script>
    import Socket from '../js/Socket.js';

    export default {
        name: 'InputPage',
        props: {
            server: Socket
        },
        data() {
            return {
                mouseIsDown: false,
                lastTouchPos: [0, 0],
                lastScroll: 0,
                lastSend: 0,
                delta: [0, 0],
                scrollDelta: 0,
                sendRate: 15,
                context: null,
                canvas: null
            }
        },
        methods: {
            getTouchPosition: function (e) {
                let x = e.pageX - e.target.offsetLeft;
                let y = e.pageY - e.target.offsetTop;
                return [x, y];
            },
            touchClick: async function (e) {
                let x = this.getTouchPosition(e)[0];
                let rightClick = x > e.target.offsetWidth / 2;

                if (rightClick) this.server.send('rightClick');
                else this.server.send('leftClick');
            },
            touchEnd: async function () {
                this.mouseIsDown = false;
            },
            touchStart: async function (e) {
                this.mouseIsDown = true;
                if (e.touches && e.touches.length === 1)
                    this.lastTouchPos = this.getTouchPosition(e.touches[0]);
                else if (e.touches && e.touches.length === 2) {
                    this.lastScroll = this.getTouchPosition(e.touches[0])[1];
                }
            },
            touchMove: async function (e) {
                if (this.mouseIsDown)
                    if (e.touches && e.touches.length === 1)
                        this.moveCursor(e);
                    else if (e.touches && e.touches.length === 2)
                        this.scroll(e);
            },
            scroll(e) {
                let [x, y] = this.getTouchPosition(e.touches[0]);
                let scrollDelta = this.lastScroll - y;
                this.lastScroll = y;
                this.server.send('scroll', Math.round(scrollDelta * -12));
            },
            moveCursor(e) {
                let [x, y] = this.getTouchPosition(e.touches[0]);
                let delta = [this.lastTouchPos[0] - x, this.lastTouchPos[1] - y];
                this.lastTouchPos = [x, y];

                this.delta[0] += delta[0];
                this.delta[1] += delta[1];

                let now = performance.now();
                if (now - this.lastSend > this.sendRate) {
                    this.server.send('moveMouse', this.delta.map(d => {

                        let isNeg = d < 0;
                        d = Math.abs(d) ** 1.5;
                        if (!isNeg)
                            d *= -1;
                        return Math.round(d);

                    }).join(','));
                    this.delta = [0, 0];
                    this.lastSend = now;
                }
            }
        }
        ,
        async mounted() {
            this.canvas = document.querySelector('.trackpad');
            this.context = this.canvas.getContext('2d');
        }
    }
</script>

<style scoped>
    .input {
        position: fixed;
        left: 0;
        width: 100%;
        bottom: 40px;
    }

    .trackpad {
        width: calc(100% - 20px);
        max-width: 500px;
        margin: 40px auto;

        background: linear-gradient(to top, #9c9c9c 0%, #b9b9b9 100%);
        border-radius: 5px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
        border: 2px solid #656565;
        height: 300px;
    }
</style>
