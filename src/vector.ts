export type Vector = [number, number];

export function vectorHash(a: Vector): number {
    return a[0] + a[1] * 1000000;
}

export function vectorAdd(a: Vector, b: Vector): Vector {
    return [a[0] + b[0], a[1] + b[1]];
}
