export const UpdateSignal = 0;
interface UpdateMessage {
    sig: 0
    age: number;
    state: string;
}

export const InputSignal = 1;
interface InputMessage {
    sig: 1;
    uuid: number;
    input: Record<string, boolean>;
}

export type AnyMessage = UpdateMessage | InputMessage;
