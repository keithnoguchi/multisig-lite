<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/Button.svelte';
	import FaCommentDollar from 'svelte-icons/fa/FaCommentDollar.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithubSquare.svelte';
	import FaWallet from 'svelte-icons/fa/FaWallet.svelte';

	let home = 'https://github.com/keithnoguchi/multisig-lite';
</script>

<Button on:click={() => goto(home)} bgColor="purple" size="small" shadow>
	<div style:width="16px">
		<FaGithub />
	</div>
</Button>

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
