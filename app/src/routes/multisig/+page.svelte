<script>
	import Button from '$lib/Button.svelte';
	import { multisig } from '../../stores/program';
</script>

<h2>Multisig Account</h2>

<ul>
	<li>State PDA: {multisig.statePda}</li>
	<li>State Bump: {multisig.stateBump}</li>
	<li>Fund PDA: {multisig.fundPda}</li>
	<li>Fund Bump: {multisig.fundBump}</li>
</ul>

<Button>Open an account</Button>
