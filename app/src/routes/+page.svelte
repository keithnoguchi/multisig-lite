<script>
	import { Program } from '@project-serum/anchor';
	import { provider } from '../stores/provider';
	import idl from '../idl/multisig_lite.json';

	$: program = newProgram($provider);
	function newProgram(provider) {
		if (!idl.metadata || !provider) return undefined;
		return new Program(idl, idl.metadata.address, provider);
	}
</script>

<h1>multisig-lite</h1>

{#if program}
	<p>ProgramID: {program.programId}</p>
{/if}
