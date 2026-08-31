/* eslint-disable @typescript-eslint/no-explicit-any */
import * as crypto from 'crypto';

export function canonicalJson(obj: any): string {
    if (obj === undefined) return '';
    if (obj === null) return 'null';
    if (typeof obj === 'number') {
        return Number.isFinite(obj) ? String(obj) : 'null';
    }
    if (typeof obj !== 'object') {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        const arr = obj.map(item => {
            if (item === undefined) return 'null';
            return canonicalJson(item);
        });
        return `[${arr.join(',')}]`;
    }

    const keys = Object.keys(obj).sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    });

    const parts: string[] = [];
    for (const k of keys) {
        const val = obj[k];
        if (val === undefined) continue;
        parts.push(`${JSON.stringify(k)}:${canonicalJson(val)}`);
    }

    return `{${parts.join(',')}}`;
}

export function sha256Canonical(obj: any): string {
    const json = canonicalJson(obj);
    return crypto.createHash('sha256').update(json, 'utf8').digest('hex');
}

