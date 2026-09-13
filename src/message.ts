export const UPDATE_SIGNAL = 0;
export interface UpdateMessage {
    sig: 0;
    age: number;
    state: string;
}

export const INPUT_SIGNAL = 1;
export interface InputMessage {
    sig: 1;
    uuid: number;
    input: Record<string, boolean>;
}

export const HOLD_SIGNAL = 2;
export interface HoldMessage {
    sig: 2;
    uuid: number;
    itemId: number;
}

export const SOUND_SIGNAL = 3;
export interface SoundMessage {
    sig: 3;
    soundId: number;
    volume: number;
}

export type AnyMessage = UpdateMessage | InputMessage | HoldMessage | SoundMessage;
