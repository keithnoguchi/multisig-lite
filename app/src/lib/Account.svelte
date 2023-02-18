<script>
	import { publicKey } from '../stores/wallet';
	import { getBalance } from '$lib/provider';

	export let address = '';

	let isHovered;

	$: balance = address && getBalance(address);
</script>

{#if $$slots.leftContent}
	<span class="left-content">
		<slot name="leftContent" />
	</span>
{/if}

{#if address}
	<span id="content">
		{#await balance}
			...
		{:then _balance}
			{(_balance / 1e9).toLocaleString('en', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}
		{:catch e}
			e.message
		{/await}
	</span>
{/if}

{#if $$slots.rightContent}
	<span class="right-content">
		<slot name="rightContent" />
	</span>
{/if}

<style lang="scss">
	#content {
		vertical-align: top;
		font-size: 30px;
		font-family: 'Courier New';
	}
</style>
