<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<header>
	<h2>Multisig Account</h2>
</header>

<table>
	<tr>
		<td>Address</td>
		<td>{data.address}</td>
	</tr>
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
	}
</style>
