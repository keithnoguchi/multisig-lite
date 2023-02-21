<script>
	import { multisig } from '../stores/program';
</script>

<h1>Your Multisig Wallet Info</h1>

{#if $multisig}
	<ul>
		<li>
			State address:
			{#await multisig.statePda()}
				...
			{:then pda}
				{pda.toString()}
			{/await}
		</li>
		<li>
			State bump:
			{#await multisig.stateBump()}
				...
			{:then bump}
				{bump}
			{/await}
		</li>
		<li>
			Fund address:
			{#await multisig.fundPda()}
				...
			{:then pda}
				{pda.toString()}
			{/await}
		</li>
		<li>
			Fund bump:
			{#await multisig.fundBump()}
				...
			{:then bump}
				{bump}
			{/await}
		</li>
	</ul>
{/if}
