<script>
	import { multisig } from '$lib/stores/program';

	import Button from '$lib/Button.svelte';
</script>

<h2>Multisig Account</h2>

<ul>
	<li>State PDA: {multisig.statePda}</li>
	<li>State bump: {multisig.stateBump}</li>
	<li>Fund PDA: {multisig.fundPda}</li>
	<li>Fund bump: {multisig.fundBump}</li>
</ul>

<Button>Open an account</Button>
