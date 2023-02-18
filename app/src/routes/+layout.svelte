<script>
	import { goto } from '$app/navigation';
	import { connect, disconnect } from '$lib/wallet';
	import { cluster } from '../stores/cluster';
	import { publicKey } from '../stores/wallet';
	import Button from '$lib/Button.svelte';
	import Account from '$lib/Account.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithub.svelte';
	import FaGithubAlt from 'svelte-icons/fa/FaGithubAlt.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';

	let githubSrc = 'https://github.com/keithnoguchi/multisig-lite/tree/main/app';
	let solIconSrc =
		'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
	$: explorer = `https://explorer.solana.com/?cluster=${$cluster}`;
	$: explorerSrc = $publicKey
		? `https://explorer.solana.com/address/${$publicKey}/?cluster=${$cluster}`
		: `https://explorer.solana.com/?cluster=${$cluster}`;
</script>

<header>
	<Button class="header-left" on:click={() => goto(githubSrc)} let:isHovered size="small">
		<div style:width="20px">
			{#if isHovered}
				<FaGithubAlt />
			{:else}
				<FaGithub />
			{/if}
		</div>
	</Button>

	<Button id="header-right" on:click={() => goto(explorerSrc)} size="small">
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
				{$cluster}
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

<style lang="scss">
	header {
		/* https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */
		display: flex;
		justify-content: space-between;
		color: white;
		background-color: purple;

		img {
			max-width: 30px;
			max-height: 30px;
			border-radius: 10px;
			vertical-align: middle;
		}
	}

	footer {
		display: flex;
		position: fixed;
		bottom: 5px;
		right: 5px;
	}
</style>
