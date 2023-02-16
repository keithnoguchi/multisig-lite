<script>
	import Button from '$lib/Button.svelte';
	import FaCommentDollar from 'svelte-icons/fa/FaCommentDollar.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';
</script>

<Button
	on:click={() => alert(true)}
	let:isLeftHovered
	bgColor="purple"
	size="large"
	shadow
	disabled
>
	<div style:width="20px" slot="leftContent">
		{#if isLeftHovered}
			<FaCommentDollar />
		{:else}
			<FaWallet />
		{/if}
	</div>
	Coming soon...
</Button>
