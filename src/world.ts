import { Entity } from "./entity.js";

export class World {
    time: number = 0;
    entities: Record<number, Entity> = {};

    static inflate(state: string): World {
        const world = Object.setPrototypeOf(JSON.parse(state), World.prototype);

        for (const entity of Object.values(world.entities)) {
            Entity.inflate(entity);
        }

        return world as World;
    }
}
