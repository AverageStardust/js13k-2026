export type Vector = [number, number];

export function vectorHash(vector: Vector) {
    return vector[0] + vector[1] * 1000000;
}
