export type Vector = [number, number];

export function vectorHash(a: Vector): number {
    return a[0] + a[1] * 1000000;
}

export function vectorAdd(a: Vector, b: Vector): Vector {
    return [a[0] + b[0], a[1] + b[1]];
}

export function vectorSub(a: Vector, b: Vector): Vector {
    return [a[0] - b[0], a[1] - b[1]];
}

export function vectorScale(a: Vector, b: number): Vector {
    return [a[0] * b, a[1] * b];
}

export function vectorNormalize(a: Vector, length: number = 1): Vector {
    return vectorScale(a, length / vectorLength(a));
}

export function vectorLength(a: Vector): number {
    return Math.hypot(a[0], a[1]);
}

export function vectorDot(a: Vector, b: Vector): number {
    return a[0] * b[0] + a[1] * b[1];
}

export function vectorModulus(a: Vector, b: Vector): Vector {
    return [modulus(a[0], b[0]), modulus(a[1], b[1])];
}

export function vectorFloor(a: Vector): Vector {
    return [Math.floor(a[0]), Math.floor(a[1])];
}

export function vectorRound(a: Vector): Vector {
    return [Math.round(a[0]), Math.round(a[1])];
}

export function vectorCeil(a: Vector): Vector {
    return [Math.ceil(a[0]), Math.ceil(a[1])];
}

export function modulus(a: number, b: number) {
    return ((a % b) + b) % b;
}

export function smoothStep(x: number): number {
    if (x < 0) return 0;
    if (x > 1) return 1;
    return 3 * x * x - 2 * x * x * x;
}

export function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
}
