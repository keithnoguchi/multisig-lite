<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/Button.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithubSquare.svelte';

	let home = 'https://github.com/keithnoguchi/multisig-lite';
</script>

<header>
	<Button on:click={() => goto(home)} bgColor="purple" size="small" shadow>
		<div style:width="8px">
			<FaGithub />
		</div>
	</Button>
</header>

<slot />

<footer />

<style>
	header {
		height: 16px;
		display: flex;
		align-items: right;
		justify-content: right;
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
