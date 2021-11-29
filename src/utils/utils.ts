export function mod(number: number, modulo: number) {
    return ((number % modulo) + modulo) % modulo;
}