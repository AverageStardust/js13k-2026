import { Player } from "./entity.js";
import { AnyMessage, InputSignal, UpdateSignal } from "./message.js";
import { World } from "./world.js";

const updateDelay = 200;

export class Server {
    age: number = Math.random();
    send!: (message: AnyMessage) => void;

    private world!: World;
    private loopHandle: number = -1;

    open(world: World) {
        this.loopHandle = setInterval(() => this.update(), updateDelay);
        this.world = world;
    }

    close() {
        clearInterval(this.loopHandle);
        this.loopHandle = -1;
    }

    receive(message: AnyMessage): void {
        if (this.loopHandle > -1 && message.sig === InputSignal) {
            if (this.world.entities[message.uuid] === undefined) {
                this.world.entities[message.uuid] = new Player();
            }
            (this.world.entities[message.uuid] as Player).input = message.input;
        }
    }

    private update() {
        for (const entity of Object.values(this.world.entities)) {
            entity.update();
        }

        this.send({
            sig: UpdateSignal,
            age: ++this.age,
            state: JSON.stringify(this.world),
        });
    }
}
