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
</script>

<header>
	<div>
		<Button on:click={() => goto(githubSrc)} let:isHovered bgColor="purple" size="small" shadow>
			<div style:width="20px">
				{#if isHovered}
					<FaGithubAlt />
				{:else}
					<FaGithub />
				{/if}
			</div>
		</Button>
	</div>

	<div>
		<Account address={$publicKey}>
			<span slot="rightContent">
				<img src={solIconSrc} alt="solana native token" />
			</span>
		</Account>
	</div>
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
		/* https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */
		display: flex;
		justify-content: space-between;
	}

	img {
		max-width: 30px;
		max-height: 30px;
		border-radius: 10px;
	}

	footer {
		display: flex;
		position: fixed;
		bottom: 5px;
		right: 5px;
	}
</style>
