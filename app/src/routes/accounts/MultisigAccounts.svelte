<svelte:options immutable={true} />

<script lang="ts">
	import { goto } from '$app/navigation';
	import { PublicKey } from '@solana/web3.js';
	import { createEventDispatcher } from 'svelte';
	import { multisig } from '$lib/stores/program';

	import Button from '$lib/Button.svelte';
	import FaRegTrashAlt from 'svelte-icons/fa/FaRegTrashAlt.svelte';

	export let accounts = [];

	// https://svelte.dev/tutorial/component-events
	const dispatch = createEventDispatcher();

	let address = '';
	async function open() {
		let pubkey;
		try {
			pubkey = new PublicKey(address);
		} catch (_e) {
			address = '';
			return;
		}
		// Avoid the duplicates.
		// Somehow, array.includes() doesn't work here...
		for (const a of accounts) {
			if (a.equals(pubkey)) {
				address = '';
				return;
			}
		}

		try {
			await multisig.open(multisig.statePda);
			const isNotCancelled = dispatch('add', { address: pubkey }, { cancelable: true });
			if (isNotCancelled) {
				address = '';
			}
		} catch (e) {
			console.error(e);
		}
	}

	async function edit(address: PublicKey) {
		if (accounts.includes(address)) {
			goto(`/accounts/${address}`);
		} else {
			try {
				await multisig.open(address);
				dispatch('add', { address }, { cancelable: true });
			} catch (e) {
				console.error(e);
			}
		}
	}

	async function close(address: PublicKey) {
		try {
			await multisig.close(address);
			dispatch('remove', { address });
		} catch (e) {
			console.error(e);
		}
	}
</script>

<header>
	<h2>Multisig Accounts</h2>
</header>

{#if accounts.length != 0}
	<table>
		{#each accounts as address, index (address)}
			<tr>
				<td class="address" on:click={edit(address)} on:keypress={edit(address)}>{address}</td>
				<td>
					<Button
						class="remove-account-button"
						aria-label="Remove account"
						shadow
						on:click={() => close(address)}
					>
						<span style:width="10px" style:display="inline-block"><FaRegTrashAlt /></span>
					</Button>
				</td>
			</tr>
		{/each}
	</table>
{/if}

<form on:submit|preventDefault={open}>
	<input placeholder="Enter a multisig account address, e.g 76ne...7qb5" bind:value={address} />
</form>

<footer>
	<p>
		<small
			class="address"
			on:click={() => edit(multisig.statePda)}
			on:keypress={() => edit(multisig.statePda)}>{multisig.statePda}</small
		>
		<br />
		is your multisig account address.
	</p>
</footer>

<style lang="scss">
	header {
		text-align: center;
	}

	table {
		float: center;
		padding: 10px;
		max-width: 200px;
		margin-left: auto;
		margin-right: auto;
		.address {
			width: 100%;
			text-align: center;
			padding-right: 10px;
			font-size: 15px;
			&:hover {
				color: purple;
				cursor: pointer;
			}
		}
	}

	form {
		float: center;
		padding: 10px;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
		input {
			font-size: 15px;
			float: center;
			width: 100%;
			border-radius: 5px;
		}
	}

	footer {
		width: 80%;
		margin-left: auto;
		margin-right: auto;
		text-align: center;
		.address {
			&:hover {
				color: purple;
				cursor: pointer;
			}
		}
	}
</style>
