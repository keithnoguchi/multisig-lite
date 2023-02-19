import { PublicKey, Transaction } from '@solana/web3.js';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

// Following @project-serum/anchor [Wallet] class.
//
// [wallet]: https://coral-xyz.github.io/anchor/ts/classes/Wallet.html#publicKey
class Wallet {
	_publicKey: PublicKey;
	signTransaction(tx: Transaction): Promise<Transaction>;
	signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
	get publicKey(): PublieKey {
		return this._publicKey;
	}
}

export const wallet: Writable<Wallet> = writable({
	_publicKey: undefined,
	signTransaction: undefined,
	signAllTransactions: undefined
});
