<script lang="ts">
	import MultisigAccounts from './MultisigAccounts.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// List the self account in case it's available on-chain.
	let accounts = data.address ? [data.address] : [];
	function add(e) {
		accounts = [...accounts, e.detail.address];
	}
	function remove(e) {
		accounts = accounts.filter((a) => a !== e.detail.address);
	}
</script>

<MultisigAccounts {accounts} on:add={add} on:remove={remove} />
