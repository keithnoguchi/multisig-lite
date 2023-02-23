import type { PageLoad } from './$types';

export const load = (({ params }) => {
	return {
		address: params.account
	};
}) satisfies PageLoad;
