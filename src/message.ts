import { World } from "./world.js";

interface GenericMessage<T extends number> {
    sig: T;
}

export const UpdateSignal = 0;
interface UpdateMessage extends GenericMessage<0> {
    age: number;
    world: World;
}

export type AnyMessage = UpdateMessage;
