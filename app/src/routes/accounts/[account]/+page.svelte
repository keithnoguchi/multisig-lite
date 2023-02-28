<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<header>
	<h2>Multisig Account</h2>
</header>

<table>
	<tr><th>Balance</th></tr>
	<tr><td>{data.balance}</td></tr>

	<tr><th>Signers ({data.threshold} / {data.signers.length})</th></tr>
	{#each data.signers as signer}
		<tr><td>{signer}</td></tr>
	{/each}

	<tr><th>Transfers ({data.transfers.length} / {data.maxQueue})</th></tr>
	{#each data.transfers as transfer}
		<tr><td>{transfer}</td></tr>
	{/each}
</table>

<style lang="scss">
	header {
		text-align: center;
	}

	table {
		float: center;
		padding: 10px;
		max-width: 200px;
		margin-left: auto;
		margin-right: auto;

		th {
			height: 30px;
		}

		td {
			text-align: right;
		}
	}
</style>
