<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { multisig } from '../stores/program';
	import Button from '$lib/Button.svelte';
</script>

{#if $multisig}
	{goto('/multisig')}
{/if}

<h1 class="center">Welcome!</h1>
<div class="center">
	<Button on:click={() => $page.data.connect()} shadow>Connect with your wallet</Button>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
	}
</style>
