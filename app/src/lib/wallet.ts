// Credit to [monomadic] and [DugAnderson444].
//
// This is a PoC before migrating to the official
// [WalletAdapter].
//
// [monomadic]: https://github.com/monomadic/solana-tokenlist/blob/master/src/lib/wallet.ts
// [duganderson444]: https://github.com/DougAnderson444/solblog/blob/master/app/src/lib/helpers/wallet-adapter-phantom.ts
// [walletadapter]: https://solana-labs.github.io/wallet-adapter/

import { wallet } from '../stores/wallet';

declare let window;

export function connect(): void {
	const provider = window && window.solana;
	if (provider) {
		provider.on('connect', onConnect);
		provider.on('disconnect', onDisconnect);
		provider.connect();
	}
}

export function disconnect(): void {
	const provider = window && window.solana;
	provider.disconnect();
}

function onConnect() {
	const provider = window && window.solana;
	wallet.update((current) => {
		return {
			...current,
			publicKey: provider.publicKey.toString()
		};
	});
}

function onDisconnect() {
	wallet.update((current) => {
		return {
			...current,
			publicKey: undefined
		};
	});
}
