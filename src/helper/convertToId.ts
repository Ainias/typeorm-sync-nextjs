export function convertToId(val: any) {
    if (typeof val === 'string') {
        const res = parseInt(val, 10);
        return Number.isNaN(res) ? undefined : res;
    }
    if (typeof val === 'number') {
        return Math.floor(val);
    }
    return undefined;
}
