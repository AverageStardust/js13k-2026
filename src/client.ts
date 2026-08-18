import { AnyMessage, UpdateSignal } from "./message.js";
import { World } from "./world.js";

export class Client {
    serverAge: number = 0;
    lastUpdate: number = Date.now();
    world?: World;
    send!: (message: AnyMessage) => void;

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
    }
}
