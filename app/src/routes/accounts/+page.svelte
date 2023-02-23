<script>
	import MultisigAccounts from './MultisigAccounts.svelte';

	let accounts = [];
	function add(e) {
		accounts = [...accounts, e.detail.address];
	}
	function remove(e) {
		accounts = accounts.filter((a) => a !== e.detail.address);
	}
</script>

<MultisigAccounts {accounts} on:add={add} on:remove={remove} />
