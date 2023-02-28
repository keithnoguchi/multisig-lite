import { multisig } from '$lib/stores/program';
import type { PageLoad } from './$types';

export const load = (async () => {
	try {
		await multisig.program.account.state.fetch(multisig.statePda);
		return {
			address: multisig.statePda
		};
	} catch (e) {
		return {};
	}
}) satisfies PageLoad;
