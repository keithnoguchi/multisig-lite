<script>
	import { goto } from '$app/navigation';
	import { connect, disconnect } from '$lib/wallet';
	import { publicKey } from '../stores/wallet';
	import Button from '$lib/Button.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithub.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';

	let home = 'https://github.com/keithnoguchi/multisig-lite';
</script>

<slot />

<footer>
	{#if $publicKey}
		<Button on:click={() => disconnect()} bgColor="purple" size="small" shadow>
			<div style:width="20px" slot="leftContent">
				<img src="/phantom.svg" alt="phantom" style:width="20px" />
			</div>
			{$publicKey}
		</Button>
	{:else}
		<Button on:click={() => connect()} let:isLeftHovered bgColor="purple" size="small" shadow>
			<div style:width="20px" slot="leftContent">
				<FaWallet />
			</div>
			Connect
		</Button>
	{/if}

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
