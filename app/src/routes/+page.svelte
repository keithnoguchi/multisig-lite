<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { multisig } from '$lib/stores/program';

	import Button from '$lib/Button.svelte';

	// Move to the multisig page once multisig program
	// is detected.
	$: if (browser && $multisig) {
		goto('/multisig');
	}
</script>

<h1 class="center">Welcome!</h1>
<div class="center">
	<Button on:click={() => $page.data.connect()} shadow>Connect to your wallet</Button>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
	}
</style>
