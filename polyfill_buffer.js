import { Platform } from 'obsidian';
import { Buffer as BufferPolyfill } from 'buffer';

let buffer;
if (Platform.isMobileApp) {
    buffer = BufferPolyfill;
} else {
    buffer = global.Buffer;
}

export const Buffer = buffer;
