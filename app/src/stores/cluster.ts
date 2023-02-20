import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

class Cluster {
	constructor(name: string) {
		this.name = name;
		this.connection = new Connection(clusterApiUrl(name));
	}
}

export const cluster: Writable<Cluster> = writable(new Cluster('devnet'));
