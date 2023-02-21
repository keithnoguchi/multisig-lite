<script>
	import { page } from '$app/stores';
	import { multisig } from '../stores/program';
	import Button from '$lib/Button.svelte';
	import Multisig from '$lib/Multisig.svelte';
</script>

{#if !$multisig}
	<h1 class="main">Welcome!</h1>

	<div class="main">
		<Button on:click={() => $page.data.connect()} shadow>Connect with your wallet</Button>
	</div>
{:else}
	<Multisig />
{/if}

<style>
	.main {
		display: flex;
		justify-content: center;
	}
</style>
