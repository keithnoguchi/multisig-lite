import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export async function getBalance(cluster: string, address: PublicKey): Promise<number> {
	const endpoint = clusterApiUrl(cluster);
	const connection = new Connection(endpoint);
	return connection.getBalance(address);
}
