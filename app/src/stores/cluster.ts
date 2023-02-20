import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const cluster: Writable<string> = writable('devnet');
