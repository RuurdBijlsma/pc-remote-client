export default class Socket {
    constructor() {
        this.events = {};
    }

    connect(ip) {
        this.ip = ip;

        this.socket = new WebSocket(this.ip);
        this.socket.onmessage = data => this.fire('rawMessage', data);
        this.socket.onopen = () => this.fire('open');
    }

    get ready() {
        if (!this.socket)
            return false;
        return this.socket.readyState === 1;
    }

    async send(action, value = '') {
        return new Promise(resolve => {
            let messageId = this.getId();
            let json = JSON.stringify({
                id: messageId,
                action, value
            });

            let onMessage;
            onMessage = data => {
                let parsed = JSON.parse(data.data);
                if (parsed.id === messageId) {
                    this.off('rawMessage', onMessage);
                    resolve(parsed.data);
                }
            };
            this.on('rawMessage', onMessage);
            if (this.ready)
                this.socket.send(json);
            else
                console.log("Server not connected (yet), can't send", action, value);
        });
    }

    fire(event, ...args) {
        if (!this.events.hasOwnProperty(event))
            return;

        for (let callback of this.events[event])
            callback(...args);
    }

    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];

        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events.hasOwnProperty(event))
            return;

        let callbacks = this.events[event];
        callbacks.splice(callbacks.indexOf(callback), 1);
    }

    getId() {
        if (!this.i) this.i = 0;
        return this.i++;
    }
}