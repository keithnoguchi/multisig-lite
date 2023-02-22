<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { wallet } from '$lib/stores/wallet';
	import { cluster } from '$lib/stores/cluster';
	import { multisig } from '$lib/stores/program';
	import type { LayoutData } from './$types';

	import Button from '$lib/Button.svelte';
	import Account from '$lib/Account.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithub.svelte';
	import FaGithubAlt from 'svelte-icons/fa/FaGithubAlt.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';

	export let data: LayoutData;

	// Move back to the top page in case no multisig
	// program is detected.
	$: if (browser && !$multisig && $page.url.pathname != '/') {
		goto('/');
	}

	let githubSrc = 'https://github.com/keithnoguchi/multisig-lite/tree/main/app';
	let solIconSrc =
		'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
	$: explorer = $wallet.address
		? `https://explorer.solana.com/address/${$wallet.address}/?cluster=${$cluster}`
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

	<Button id="header-right" on:click={() => goto(explorer)} size="small">
		<Account address={$wallet.address} prefix="$">
			<span slot="rightContent">
				<img src={solIconSrc} alt="solana native token" />
			</span>
		</Account>
	</Button>
</header>

<slot />

<footer>
	{#if $wallet.address}
		<Button on:click={() => data.disconnect()} let:isHovered size="large" shadow>
			<div style:width="20px" slot="leftContent">
				<img src="/phantom.svg" alt="phantom" style:width="20px" />
			</div>
			{#if isHovered}
				{$wallet.address}
			{:else}
				{$cluster}
			{/if}
		</Button>
	{:else}
		<Button on:click={() => data.connect()} size="large" shadow>
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
