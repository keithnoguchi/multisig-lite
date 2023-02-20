import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { PublicKey, Transaction } from '@solana/web3.js';

// Following @project-serum/anchor [Wallet] class.
//
// [wallet]: https://coral-xyz.github.io/anchor/ts/classes/Wallet.html#publicKey
export class Wallet {
	constructor(publicKey: PublicKey = undefined) {
		this.publicKey = publicKey;
		if (publicKey) {
			this.address = publicKey.toString();
		} else {
			this.address = undefined;
		}
	}
	signTransaction(tx: Transaction): Promise<Transaction>;
	signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

export const wallet: Writable<Wallet> = writable(new Wallet());
