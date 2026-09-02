import { Player } from "./entity.js";
import { AnyMessage, INPUT_SIGNAL, UPDATE_SIGNAL } from "./message.js";
import { World } from "./world.js";

const UPDATE_DELAY = 200;

export class Server {
    age: number = Math.random();
    send!: (message: AnyMessage) => void;

    private world!: World;
    private loopHandle: number = -1;

    open(world: World) {
        console.log("open")
        this.loopHandle = setInterval(() => this.update(), UPDATE_DELAY);
        this.world = world;
    }

    close() {
        console.log("close")
        clearInterval(this.loopHandle);
        this.loopHandle = -1;
    }

    receive(message: AnyMessage): void {
        if (this.loopHandle > -1 && message.sig === INPUT_SIGNAL) {
            if (this.world.entities[message.uuid] === undefined) {
                this.world.entities[message.uuid] = new Player();
            }
            (this.world.entities[message.uuid] as Player).setInput(message.input, this.world.time);
        }
    }

    private update() {
        for (const entity of Object.values(this.world.entities)) {
            if (entity.active) {
                entity.update(this.world.time);
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
