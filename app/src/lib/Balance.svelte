<script>
	import { publicKey } from '../stores/wallet';
	import { getBalance } from '$lib/provider';

	$: balance = $publicKey && getBalance($publicKey);

	let src =
		'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
</script>

<img {src} alt="solana native token" />
{#if $publicKey}
	{#await balance}
		...
	{:then _balance}
		{(_balance / 1e9).toLocaleString('en', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}
		SOL
	{:catch e}
		e.message
	{/await}
{/if}

<style lang="scss">
	img {
		max-width: 20px;
		max-height: 20px;
		border-radius: 5px;
	}
</style>
