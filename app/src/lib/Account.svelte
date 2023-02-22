<script lang="ts">
	import { provider } from '$lib/stores/provider';
	import { PublicKey } from '@solana/web3.js';

	export let address = '';
	export let prefix = '';
	export let suffix = '';
	export let minimumFractionDigits = 2;
	export let maximumFractionDigits = 3;

	async function getBalance(address: string): Promise<number> {
		const publicKey = new PublicKey(address);
		return $provider.connection.getBalance(publicKey);
	}
</script>

<div>
	{#if $$slots.leftContent}
		<span id="left-content">
			<slot name="leftContent" />
		</span>
	{/if}

	{#if address}
		<span id="content">
			{#await getBalance(address)}
				...
			{:then _balance}
				{prefix +
					(_balance / 1e9).toLocaleString('en', {
						minimumFractionDigits,
						maximumFractionDigits
					}) +
					suffix}
			{:catch e}
				{e.message}
			{/await}
		</span>
	{/if}

	{#if $$slots.rightContent}
		<span id="right-content">
			<slot name="rightContent" />
		</span>
	{/if}
</div>

<style lang="scss">
	#content {
		font-size: 25px;
		font-weight: normal;
		font-family: 'Courier New';
		vertical-align: bottom;
	}
</style>
