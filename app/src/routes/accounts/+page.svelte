<script>
	import MultisigAccounts from './MultisigAccounts.svelte';

	export let data;

	let accounts = data.address ? [data.address] : [];
	function add(e) {
		accounts = [...accounts, e.detail.address];
	}
	function remove(e) {
		accounts = accounts.filter((a) => a !== e.detail.address);
	}
</script>

<MultisigAccounts {accounts} on:add={add} on:remove={remove} />
