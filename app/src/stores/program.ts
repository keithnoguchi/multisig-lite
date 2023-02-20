import { Program } from '@project-serum/anchor';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import idl from '../idl/multisig_lite.json';

export const multisig: Writable<Program> = writable(undefined);
