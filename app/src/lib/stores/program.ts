import { get, writable } from 'svelte/store';
import { PublicKey } from '@solana/web3.js';
import { utils, Program } from '@project-serum/anchor';
import multisigIdl from '$lib/idl/multisig_lite.json';
import type { Provider } from '@project-serum/anchor';

class Multisig {
	constructor() {
		this._program = writable(undefined);
	}

	subscribe(run) {
		return this._program.subscribe(run);
	}

	async set(provider: Provider) {
		const idl = multisigIdl;
		if (!provider || !idl.metadata || !idl.metadata.address) {
			this._program.set(undefined);
			return;
		}
		const programId = idl.metadata.address;
		const program = new Program(idl, programId, provider);
		const [statePda, stateBump] = await this.findPda(
			program.programId,
			'state',
			program.provider.publicKey
		);
		const [fundPda, fundBump] = await this.findPda(program.programId, 'fund', statePda);
		this.statePda = statePda;
		this.stateBump = stateBump;
		this.fundPda = fundPda;
		this.fundBump = fundBump;
		this._program.set(program);
	}

	get program() {
		return get(this._program);
	}

	get programId(): PublicKey | undefined {
		return this.program?.programId;
	}

	get publicKey(): PublicKey | undefined {
		return this.program?.provider.publicKey;
	}

	async open(address: PublicKey) {
		if (address.equals(this.statePda)) {
			// Hard coded values for now.
			const m = 1;
			const signers = [PublicKey.unique(), this.publicKey];
			const maxQueue = 10;
			await this.program.methods
				.create(m, signers, maxQueue, this.stateBump, this.fundBump)
				.accounts({
					funder: this.publicKey,
					state: this.statePda,
					fund: this.fundPda
				})
				.rpc();
		} else {
			// Only check if the account actually exists.
			await this.program.account.state.fetch(address);
		}
	}

	async close(address: PublicKey) {
		if (address.equals(this.statePda)) {
			await this.program.methods
				.close(this.stateBump, multisig.fundBump)
				.accounts({
					funder: this.publicKey,
					state: this.statePda,
					fund: this.fundPda
				})
				.rpc();
		}
	}

	async findPda(
		programId: PublicKey,
		name: string,
		publicKey: PublicKey
	): Promise<[PublicKey, number]> {
		return await PublicKey.findProgramAddress(
			[utils.bytes.utf8.encode(name), publicKey.toBuffer()],
			programId
		);
	}
}

export const multisig = new Multisig();
