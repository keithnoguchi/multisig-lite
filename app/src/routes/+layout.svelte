<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/Button.svelte';
	import FaGithub from 'svelte-icons/fa/FaGithubSquare.svelte';

	let home = 'https://github.com/keithnoguchi/multisig-lite';
</script>

<header>
	<Button on:click={() => goto(home)} bgColor="purple" size="small" shadow>
		<div style:width="16px">
			<FaGithub />
		</div>
	</Button>
</header>

<slot />

<footer />
