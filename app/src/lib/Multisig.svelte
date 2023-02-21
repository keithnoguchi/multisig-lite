<script>
	import Button from '$lib/Button.svelte';
	import { multisig } from '../stores/program';
</script>

<h1>Your Multisig Wallet Info</h1>

<ul>
	{#await multisig.statePda()}
		...
	{:then pda}
		<li>Multisig address: {pda.toString()}</li>
	{/await}
	{#await multisig.fundPda()}
		...
	{:then pda}
		<li>Fund address: {pda.toString()}</li>
	{/await}
</ul>

<Button>Open an account</Button>
