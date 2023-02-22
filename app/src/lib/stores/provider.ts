import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Provider } from '@project-serum/anchor';

export const provider: Writable<Provider> = writable(undefined);
