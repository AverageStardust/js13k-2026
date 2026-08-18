import { AnyMessage, UpdateSignal } from "./message.js";
import { World } from "./world.js";

export class Client {
    serverAge: number = 0;
    lastUpdate: number;
    world?: World;
    send!: (message: AnyMessage) => void;

    ctx: CanvasRenderingContext2D;
    inventory: HTMLDivElement;

    constructor() {
        this.lastUpdate = Date.now();

        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.inventory = document.querySelector("div") as HTMLDivElement;
    }

    resetConnection() {
        this.world = undefined;
        this.serverAge = 0;
    }

    receive(message: AnyMessage): void {
        if (message.sig === UpdateSignal) {
            if (message.age > this.serverAge) {
                this.updateWorld(message.world);
                this.serverAge = message.age;
                this.lastUpdate = Date.now();
            }
        }
    }

    updateWorld(world: World) {
        this.world = world;
        this.render();
    }

    render() {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, 512, 512);

        this.ctx.font = "30px Courier New, monospace";
        this.ctx.textAlign = "center";
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
                this.ctx.fillStyle = "#fff";
                this.ctx.fillText("A", x * 32 + 16, y * 32 + 28);
            }
        }

        this.inventory.innerText = ["item1", "item2", "item3"].join("\n");
    }
}
