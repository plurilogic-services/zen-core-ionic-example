const encoder = new TextEncoder();
const decoder = new TextDecoder();

export abstract class BtrieveHelper {

    private static get isLittleEndian(): boolean {
        const array = new Uint8Array(4);
        const view = new Uint32Array(array.buffer);
        // tslint:disable-next-line: no-bitwise
        return !!((view[0] = 1) & array[0]);
    }

    static stringToBytes(str: string, length?: number): Uint8Array {
        const encoded = encoder.encode(str);
        if (length && encoded.length >= length) { // Truncate and ensure null terminated
            const result = new Uint8Array(length);
            result.set(encoded.subarray(0, length - 1));
            return result;
        } else if (encoded[encoded.length - 1] !== 0) { // Add null termination
            const result = new Uint8Array(encoded.length + 1);
            result.set(encoded);
            return result;
        }

        return encoded;
    }

    static bytesToString(bytes: Uint8Array, offset: number = 0, size: number = null): string {
        if (offset || size) {
            size = size === null ? bytes.length - offset : size;
            bytes = bytes.subarray(offset, offset + size);
        }

        const nullTermination = bytes.findIndex(byte => byte === 0);
        const stringBytes = bytes.subarray(0, nullTermination);
        const decoded = decoder.decode(stringBytes);
        return decoded;
    }

    static setString(buffer: Uint8Array, offset: number, str: string, size: number) {
        buffer.set(BtrieveHelper.stringToBytes(str, size), offset);
    }

    static getString(buffer: Uint8Array, offset: number, size: number) {
        return BtrieveHelper.bytesToString(buffer, offset, size);
    }

    static setInt8(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setInt8(offset, value);
    }

    static getInt8(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getInt8(offset);
    }

    static setUint8(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setUint8(offset, value);
    }

    static getUint8(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getUint8(offset);
    }

    static setInt16(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setInt16(offset, value, BtrieveHelper.isLittleEndian);
    }

    static getInt16(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getInt16(offset, BtrieveHelper.isLittleEndian);
    }

    static setUint16(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setUint16(offset, value, BtrieveHelper.isLittleEndian);
    }

    static getUint16(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getUint16(offset, BtrieveHelper.isLittleEndian);
    }

    static setInt32(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setInt32(offset, value, BtrieveHelper.isLittleEndian);
    }

    static getInt32(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getInt32(offset, BtrieveHelper.isLittleEndian);
    }

    static setUint32(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setUint32(offset, value, BtrieveHelper.isLittleEndian);
    }

    static getUint32(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getUint32(offset, BtrieveHelper.isLittleEndian);
    }

    static setFloat32(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setFloat32(offset, value, BtrieveHelper.isLittleEndian);
    }

    static getFloat32(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getFloat32(offset, BtrieveHelper.isLittleEndian);
    }

    static setFloat64(buffer: Uint8Array, offset: number, value: number) {
        const dataView = new DataView(buffer.buffer);

        dataView.setFloat64(offset, value, BtrieveHelper.isLittleEndian);
    }

    static getFloat64(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return dataView.getFloat64(offset, BtrieveHelper.isLittleEndian);
    }

    static setDate(buffer: Uint8Array, offset: number, value: Date) {
        const dataView = new DataView(buffer.buffer);

        dataView.setFloat64(offset, value.getTime(), BtrieveHelper.isLittleEndian);
    }

    static getDate(buffer: Uint8Array, offset: number) {
        const dataView = new DataView(buffer.buffer);

        return new Date(dataView.getFloat64(offset, BtrieveHelper.isLittleEndian));
    }

}
