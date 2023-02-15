<script>
	import Button from '$lib/Button.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';
</script>

<Button size="large" shadow>
	<div style:width="20px" slot="leftContent">
		<FaWallet />
	</div>
	Coming soon...
</Button>
