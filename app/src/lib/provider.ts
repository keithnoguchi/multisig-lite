import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const endpoint = clusterApiUrl(); // devnet by default.
const connection = new Connection(endpoint);

export async function getBalance(publicKey: string): Promise<number> {
	const key = new PublicKey(publicKey);
	return connection.getBalance(key);
}
