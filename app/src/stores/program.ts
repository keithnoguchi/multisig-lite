import { PublicKey } from '@solana/web3.js';
import { utils, Program } from '@project-serum/anchor';
import type { Provider } from '@project-serum/anchor';
import { writable } from 'svelte/store';
import multisigIdl from '../idl/multisig_lite.json';

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
		const [statePda, stateBump] = await this.findPda(program, 'state');
		const [fundPda, fundBump] = await this.findPda(program, 'fund');
		this.statePda = statePda;
		this.stateBump = stateBump;
		this.fundPda = fundPda;
		this.fundBump = fundBump;
		this._program.set(program);
	}

	async findPda(program: Program, name: string): Promise<[PublicKey, number]> {
		return await PublicKey.findProgramAddress(
			[utils.bytes.utf8.encode(name), program.provider.publicKey.toBuffer()],
			program.programId
		);
	}
}

export const multisig = new Multisig();
