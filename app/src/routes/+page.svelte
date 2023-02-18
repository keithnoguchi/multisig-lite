<script>
	import Account from '$lib/Account.svelte';
	import { publicKey } from '../stores/wallet';

	let solIconSrc =
		'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
</script>

<Account address={$publicKey} unit="$">
	<span slot="leftContent">
		<img src={solIconSrc} alt="solana native token" />
	</span>
</Account>

<style lang="scss">
	img {
		max-width: 20px;
		max-height: 20px;
		border-radius: 5px;
	}
</style>
