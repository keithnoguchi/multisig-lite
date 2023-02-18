<script>
	export let address = '';
	export let unit = '$';

	import { publicKey } from '../stores/wallet';
	import { getBalance } from '$lib/provider';

	let isHovered;

	$: balance = address && getBalance(address);
</script>

<div>
	{#if $$slots.leftContent}
		<span class="left-content">
			<slot name="leftContent" />
		</span>
	{/if}
	{#if address}
		<span class="balance">
			{#await balance}
				...
			{:then _balance}
				{unit}
				{(_balance / 1e9).toLocaleString('en', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})}
			{:catch e}
				e.message
			{/await}
		</span>
	{/if}
</div>
