import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { PublicKey, Transaction } from '@solana/web3.js';

// Following @project-serum/anchor [Wallet] class.
//
// [wallet]: https://coral-xyz.github.io/anchor/ts/classes/Wallet.html#publicKey
class Wallet {
	address: string;
	publicKey: PublicKey;
	signTransaction(tx: Transaction): Promise<Transaction>;
	signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

export const wallet: Writable<Wallet> = writable({
	address: undefined,
	publicKey: undefined,
	signTransaction: undefined,
	signAllTransactions: undefined
});
