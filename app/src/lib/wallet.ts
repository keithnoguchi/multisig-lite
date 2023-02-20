// Credit to [monomadic] and [DugAnderson444].
//
// This is a PoC before migrating to the official
// [WalletAdapter].
//
// [monomadic]: https://github.com/monomadic/solana-tokenlist/blob/master/src/lib/wallet.ts
// [duganderson444]: https://github.com/DougAnderson444/solblog/blob/master/app/src/lib/helpers/wallet-adapter-phantom.ts
// [walletadapter]: https://solana-labs.github.io/wallet-adapter/

import { get } from 'svelte/store';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider } from '@project-serum/anchor';
import { wallet, Wallet } from '../stores/wallet';
import { cluster } from '../stores/cluster';
import { provider } from '../stores/provider';

declare let window;

export function connect(): void {
	const adaptor = window && window.solana;
	if (adaptor) {
		adaptor.on('connect', onConnect);
		adaptor.on('disconnect', onDisconnect);
		adaptor.connect();
	}
}

export function disconnect(): void {
	const adaptor = window && window.solana;
	adaptor.disconnect();
}

function onConnect() {
	const adaptor = window && window.solana;
	if (!adaptor) {
		wallet.set(new Wallet());
		return;
	}

	// Setup the wallet.
	const { publicKey, signTransaction, signAllTransactions } = adaptor;
	const newWallet = new Wallet(publicKey);
	newWallet.signTransaction = signTransaction;
	newWallet.signAllTransactions = signAllTransactions;
	wallet.set(newWallet);

	// and the provider.
	const connection = new Connection(clusterApiUrl(get(cluster)));
	const opts = { commitment: 'confirmed' };
	const newProvider = new AnchorProvider(connection, newWallet, opts);
	provider.set(newProvider);
}

function onDisconnect() {
	provider.set(undefined);
	wallet.set(new Wallet());
}
