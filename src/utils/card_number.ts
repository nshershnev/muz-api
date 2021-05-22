export const generateCardNumber = (n: any, width: any, z: string): string => {
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};