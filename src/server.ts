import {
    AnyMessage,
    UpdateSignal,
} from "./message.js";
import { createWorld, World } from "./world.js";

const updateDelay = 200;

export class Server {
    age: number = Math.random();
    send!: (message: AnyMessage) => void;

    private world!: World;
    private loopHandle: number = -1;

    open(world: World = createWorld()) {
        this.loopHandle = setInterval(() => this.update, updateDelay);
        this.world = world;
    }

    close() {
        clearInterval(this.loopHandle);
        this.loopHandle = -1;
    }

    receive(_: AnyMessage): void {}

    private update() {
        this.send({
            sig: UpdateSignal,
            age: ++this.age,
            world: this.world,
        });
    }
}
