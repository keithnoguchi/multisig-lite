<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/Button.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithubSquare.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';

	let home = 'https://github.com/keithnoguchi/multisig-lite';
</script>

<slot />

<footer>
	<Button
		on:click={() => alert(true)}
		let:isLeftHovered
		bgColor="purple"
		size="small"
		shadow
		disabled
	>
		<div style:width="20px" slot="leftContent">
			{#if isLeftHovered}
				<img src="/phantom.svg" alt="phantom" style:width="20px" />
			{:else}
				<FaWallet />
			{/if}
		</div>
		Coming soon...
	</Button>

	<Button on:click={() => goto(home)} bgColor="purple" size="small" shadow>
		<div style:width="20px">
			<FaGithub />
		</div>
	</Button>
</footer>

<style>
	footer {
		display: flex;
		position: fixed;
		bottom: 0;
		right: 0;
	}
</style>
