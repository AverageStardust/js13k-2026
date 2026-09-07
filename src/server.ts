import { Player } from "./being.js";
import { AnyMessage, INPUT_SIGNAL, UPDATE_SIGNAL } from "./message.js";
import { World } from "./world.js";

const UPDATE_DELAY = 100;

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
            let player = this.world.beings[message.uuid] as Player;

            if (player === undefined) {
                player = new Player();
                this.world.beings[message.uuid] = player;
            }

            player.setInput(message.input, this.world.time);
        }
    }

    private update() {
        this.world.update();

        for (const being of Object.values(this.world.beings)) {
            if (being.active) {
                being.update(this.world);
            }
        }

        this.world.time += UPDATE_DELAY;
        this.send({
            sig: UPDATE_SIGNAL,
            age: ++this.age,
            state: JSON.stringify(this.world),
        });
    }
}
