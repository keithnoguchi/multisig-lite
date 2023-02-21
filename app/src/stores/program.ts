import { PublicKey } from '@solana/web3.js';
import { utils, Program } from '@project-serum/anchor';
import type { Provider } from '@project-serum/anchor';
import { get, writable } from 'svelte/store';
import multisigIdl from '../idl/multisig_lite.json';

class Multisig {
	constructor() {
		this._program = writable(undefined);
		this._statePda = undefined;
	}

	subscribe(run) {
		return this._program.subscribe(run);
	}

	set(provider: Provider) {
		const idl = multisigIdl;
		if (!provider || !idl.metadata || !idl.metadata.address) {
			this._program.set(undefined);
			this._statePda = undefined;
			this._stateBump = undefined;
			this._fundPda = undefined;
			this._fundBump = undefined;
			return;
		}
		const programId = idl.metadata.address;
		this._program.set(new Program(idl, programId, provider));
	}

	async statePda(): Promise<PublicKey | undefined> {
		let program = get(this._program);
		if (!program) return undefined;
		if (this._statePda) return this._statePda;
		const [pda, bump] = await PublicKey.findProgramAddress(
			[utils.bytes.utf8.encode('state'), program.provider.publicKey.toBuffer()],
			program.programId
		);
		this._statePda = pda;
		this._stateBump = bump;
		return pda;
	}

	async stateBump(): Promise<number | undefined> {
		let program = get(this._program);
		if (!program) return undefined;
		if (this._stateBump) return this._stateBump;
		const [pda, bump] = await PublicKey.findProgramAddress(
			[utils.bytes.utf8.encode('state'), program.provider.publicKey.toBuffer()],
			program.programId
		);
		this._statePda = pda;
		this._stateBump = bump;
		return bump;
	}

	async fundPda(): Promise<PublicKey | undefined> {
		let program = get(this._program);
		if (!program) return undefined;
		if (this._fundPda) return this._fundPda;
		const [pda, bump] = await PublicKey.findProgramAddress(
			[utils.bytes.utf8.encode('fund'), program.provider.publicKey.toBuffer()],
			program.programId
		);
		this._fundPda = pda;
		this._fundBump = bump;
		return pda;
	}

	async fundBump(): Promise<number | undefined> {
		let program = get(this._program);
		if (!program) return undefined;
		if (this._stateBump) return this._stateBump;
		const [pda, bump] = await PublicKey.findProgramAddress(
			[utils.bytes.utf8.encode('fund'), program.provider.publicKey.toBuffer()],
			program.programId
		);
		this._fundPda = pda;
		this._fundBump = bump;
		return bump;
	}
}

export const multisig = new Multisig();
