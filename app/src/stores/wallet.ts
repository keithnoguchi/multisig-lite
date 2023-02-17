import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const publicKey: Writable<string> = writable(undefined);
