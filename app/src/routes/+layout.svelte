<script>
	import { goto } from '$app/navigation';
	import { connect, disconnect } from '$lib/wallet';
	import { publicKey } from '../stores/wallet';
	import Button from '$lib/Button.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithub.svelte';
	import FaGithubAlt from 'svelte-icons/fa/FaGithubAlt.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';

	let src = 'https://github.com/keithnoguchi/multisig-lite/tree/main/app';
</script>

<header>
	<Button on:click={() => goto(src)} let:isHovered bgColor="purple" size="small" shadow>
		<div style:width="20px">
			{#if isHovered}
				<FaGithubAlt />
			{:else}
				<FaGithub />
			{/if}
		</div>
	</Button>
</header>

<slot />

<footer>
	{#if $publicKey}
		<Button on:click={() => disconnect()} let:isHovered bgColor="purple" size="large" shadow>
			<div style:width="20px" slot="leftContent">
				<img src="/phantom.svg" alt="phantom" style:width="20px" />
			</div>
			{#if isHovered}
				{$publicKey}
			{:else}
				Connected
			{/if}
		</Button>
	{:else}
		<Button on:click={() => connect()} bgColor="purple" size="large" shadow>
			<div style:width="20px" slot="leftContent">
				<FaWallet />
			</div>
			Connect
		</Button>
	{/if}
</footer>

<style>
	header {
		display: flex;
		position: fixed;
		top: 5px;
		right: 5px;
	}

	footer {
		display: flex;
		position: fixed;
		bottom: 5px;
		right: 5px;
	}
</style>
