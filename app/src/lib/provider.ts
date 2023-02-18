import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export async function getBalance(cluster: string, address: string): Promise<number> {
	const endpoint = clusterApiUrl(cluster);
	const connection = new Connection(endpoint);
	const key = new PublicKey(address);
	return connection.getBalance(key);
}
