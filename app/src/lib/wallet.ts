// Credit to [monomadic].
//
// [monomadic]: https://github.com/monomadic/solana-tokenlist/blob/master/src/lib/wallet.ts

import { publicKey } from '../stores/wallet';

declare let window: any;

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
	publicKey.set(provider.publicKey.toString());
}

function onDisconnect() {
	publicKey.set(undefined);
}
