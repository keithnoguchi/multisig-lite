import { PublicKey } from '@solana/web3.js';
import { utils, Program } from '@project-serum/anchor';
import type { Provider } from '@project-serum/anchor';
import { get, writable } from 'svelte/store';
import multisigIdl from '../idl/multisig_lite.json';

class Multisig {
	constructor() {
		this._program = writable(undefined);
	}

	subscribe(run) {
		return this._program.subscribe(run);
	}

	set(provider: Provider) {
		const idl = multisigIdl;
		if (!provider || !idl.metadata || !idl.metadata.address) {
			this._program.set(undefined);
			return;
		}
		const programId = idl.metadata.address;
		this._program.set(new Program(idl, programId, provider));
	}

	async statePda(): Promise<PublicKey | undefined> {
		const program = get(this._program);
		if (!program) return undefined;
		if (this._statePda) return this._statePda;
		const [pda, bump] = await this.findPda(program, 'state');
		this._statePda = pda;
		this._stateBump = bump;
		return pda;
	}

	async stateBump(): Promise<number | undefined> {
		const program = get(this._program);
		if (!program) return undefined;
		if (this._stateBump) return this._stateBump;
		const [pda, bump] = await this.findPda(program, 'state');
		this._statePda = pda;
		this._stateBump = bump;
		return bump;
	}

	async fundPda(): Promise<PublicKey | undefined> {
		const program = get(this._program);
		if (!program) return undefined;
		const [pda, bump] = await this.findPda(program, 'fund');
		this._fundPda = pda;
		this._fundBump = bump;
		return pda;
	}

	async fundBump(): Promise<number | undefined> {
		const program = get(this._program);
		if (!program) return undefined;
		if (this._stateBump) return this._stateBump;
		const [pda, bump] = await this.findPda(program, 'fund');
		this._fundPda = pda;
		this._fundBump = bump;
		return bump;
	}

	async findPda(program: Program, name: string): Promise<[PublicKey, number]> {
		return await PublicKey.findProgramAddress(
			[utils.bytes.utf8.encode(name), program.provider.publicKey.toBuffer()],
			program.programId
		);
	}
}

export const multisig = new Multisig();
