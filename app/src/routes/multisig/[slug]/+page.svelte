<script lang="ts">
	import type { PageData } from './$types';
	import MultisigAccount from './MultisigAccount.svelte';

	export let data: PageData;
</script>

<MultisigAccount address={data.address} />
