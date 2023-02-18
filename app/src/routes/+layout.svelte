<script>
	import { goto } from '$app/navigation';
	import { connect, disconnect } from '$lib/wallet';
	import { publicKey } from '../stores/wallet';
	import Button from '$lib/Button.svelte';
	import Account from '$lib/Account.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithub.svelte';
	import FaGithubAlt from 'svelte-icons/fa/FaGithubAlt.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';

	let githubSrc = 'https://github.com/keithnoguchi/multisig-lite/tree/main/app';
	let solIconSrc =
		'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
	$: explorerSrc = $publicKey
		? `https://explorer.solana.com/address/${$publicKey}/?cluster=devnet`
		: `https://explorer.solana.com/?cluster=devnet`;
</script>

<header>
	<Button on:click={() => goto(githubSrc)} let:isHovered size="small">
		<div style:width="20px">
			{#if isHovered}
				<FaGithubAlt />
			{:else}
				<FaGithub />
			{/if}
		</div>
	</Button>

	<Button on:click={() => goto(explorerSrc)} size="small">
		<Account address={$publicKey} prefix="$">
			<span slot="rightContent">
				<img src={solIconSrc} alt="solana native token" />
			</span>
		</Account>
	</Button>
</header>

<slot />

<footer>
	{#if $publicKey}
		<Button on:click={() => disconnect()} let:isHovered size="large" shadow>
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
		<Button on:click={() => connect()} size="large" shadow>
			<div style:width="20px" slot="leftContent">
				<FaWallet />
			</div>
			Connect
		</Button>
	{/if}
</footer>

<style>
	header {
		/* https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */
		display: flex;
		justify-content: space-between;
		color: white;
		background-color: purple;
	}

	img {
		max-width: 30px;
		max-height: 30px;
		border-radius: 10px;
		vertical-align: middle;
	}

	footer {
		display: flex;
		position: fixed;
		bottom: 5px;
		right: 5px;
	}
</style>
