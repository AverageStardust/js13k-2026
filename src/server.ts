import { Player } from "./being.js";
import { AnyMessage, INPUT_SIGNAL, UPDATE_SIGNAL } from "./message.js";
import { World } from "./world.js";

const UPDATE_DELAY = 200;

export class Server {
    age: number = Math.random();
    send!: (message: AnyMessage) => void;

    private world!: World;
    private loopHandle: number = -1;

    open(world: World) {
        if (this.loopHandle == -1) {
            this.loopHandle = setInterval(() => this.update(), UPDATE_DELAY);
            this.world = world;
        }
    }

    close() {
        clearInterval(this.loopHandle);
        this.loopHandle = -1;
    }

    receive(message: AnyMessage): void {
        if (this.loopHandle > -1 && message.sig === INPUT_SIGNAL) {
            if (this.world.beings[message.uuid] === undefined) {
                this.world.beings[message.uuid] = new Player();
            }
            (this.world.beings[message.uuid] as Player).setInput(message.input, this.world.time);
        }
    }

    private update() {
        for (const being of Object.values(this.world.beings)) {
            if (being.active) {
                being.update(this.world);
            }
        }

        this.world.time++;
        this.send({
            sig: UPDATE_SIGNAL,
            age: ++this.age,
            state: JSON.stringify(this.world),
        });
    }
}
