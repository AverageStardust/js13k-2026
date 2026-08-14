import { WebSocket } from "https://cdn.jsdelivr.net/npm/partysocket@1.3.0/dist/index.js";
const ws = new WebSocket("http://localhost:3000/ws");

ws.onopen = () => {
    ws.send("Hello js13k!");
};

ws.onmessage = async (event: MessageEvent<Blob>) => {
    console.log(await event.data.text());
};
