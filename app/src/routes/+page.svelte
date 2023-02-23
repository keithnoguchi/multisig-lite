<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { multisig } from '$lib/stores/program';

	import Button from '$lib/Button.svelte';

	// Move to the accounts page once multisig program is detected.
	$: if (browser && $multisig) {
		goto('/accounts');
	}
</script>

<header>
	<h1>Welcome!</h1>
</header>

<article>
	<Button on:click={() => $page.data.connect()} shadow>Connect to your wallet</Button>
</article>

<style lang="scss">
	header {
		text-align: center;
	}
	article {
		display: flex;
		justify-content: center;
	}
</style>
