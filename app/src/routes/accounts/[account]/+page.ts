import { multisig } from '$lib/stores/program';
import { PublicKey } from '@solana/web3.js';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	if (!multisig.program) {
		return;
	}
	try {
		const stateAddress = new PublicKey(params.account);
		const account = await multisig.program.account.state.fetch(stateAddress);
		return {
			stateAddress,
			balance: account.balance,
			threshold: account.m,
			maxQueue: account.q,
			signers: account.signers,
			transfers: account.queue
		};
	} catch (e) {
		console.error(e);
		return {};
	}
}) satisfies PageLoad;
