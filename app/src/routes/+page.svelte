<script>
	import { multisig } from '../stores/program';
</script>

<h1>multisig-lite</h1>

{#if $multisig}
	<p>ProgramID: {$multisig.programId}</p>
{/if}
