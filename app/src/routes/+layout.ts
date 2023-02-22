// Credit to [monomadic] and [DugAnderson444].
//
// This is a PoC before migrating to the official
// [WalletAdapter].
//
// [monomadic]: https://github.com/monomadic/solana-tokenlist/blob/master/src/lib/wallet.ts
// [duganderson444]: https://github.com/DougAnderson444/solblog/blob/master/app/src/lib/helpers/wallet-adapter-phantom.ts
// [walletadapter]: https://solana-labs.github.io/wallet-adapter/

import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { wallet, Wallet } from '$lib/stores/wallet';
import { cluster } from '$lib/stores/cluster';
import { provider } from '$lib/stores/provider';
import { multisig } from '$lib/stores/program';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider } from '@project-serum/anchor';

// https://kit.svelte.dev/docs/load#layout-data
export const load = () => {
	// It's only relevant on CSR, as it's a dApp. :)
	//
	// https://anthonyrileyorg.wordpress.com/2021/12/31/creating-a-dapp-with-sveltekit/
	if (browser) {
		return {
			connect: connect,
			disconnect: disconnect
		};
	}
};

function connect(): void {
	const adaptor = window && window.solana;
	if (adaptor) {
		adaptor.on('connect', onConnect);
		adaptor.on('disconnect', onDisconnect);
		adaptor.connect();
	}
}

function disconnect(): void {
	const adaptor = window && window.solana;
	adaptor.disconnect();
}

async function onConnect() {
	const adaptor = window && window.solana;
	if (!adaptor) {
		wallet.set(new Wallet());
		return;
	}

	// This cascadiung update should be handled by
	// the reactive bindings.

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

	// and the multisig program.
	await multisig.set(newProvider);
}

function onDisconnect() {
	multisig.set(undefined);
	provider.set(undefined);
	wallet.set(new Wallet());
}
