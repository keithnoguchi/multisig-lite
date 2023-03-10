//! `multisig_list::multisig_list::create_transfer` instruction example.
//!
//! Run with:
//! ```
//! cargo run --example create-transfer
//! ```

use std::error::Error;
use std::rc::Rc;

use clap::{Parser, ValueEnum};
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::read_keypair_file;
use solana_sdk::signer::{keypair::Keypair, Signer};
use solana_sdk::system_program;

use anchor_client::{Client, Cluster};

#[derive(Debug, Parser)]
struct Args {
    /// A Solana cluster.
    #[arg(short, long, value_enum, default_value_t = ClusterArg::Localnet)]
    cluster: ClusterArg,

    /// Lamports to fund to the multisig fund account, 0.001SOL by default.
    #[arg(short, long, default_value_t = 1_000_000)]
    lamports: u64,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, ValueEnum)]
enum ClusterArg {
    Mainnet,
    Devnet,
    Localnet,
}

impl From<ClusterArg> for Cluster {
    fn from(arg: ClusterArg) -> Self {
        match arg {
            ClusterArg::Mainnet => Self::Mainnet,
            ClusterArg::Devnet => Self::Devnet,
            ClusterArg::Localnet => Self::Localnet,
        }
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let args = Args::parse();
    let funder = Rc::new(read_keypair_file(
        shellexpand::tilde("~/.config/solana/id.json").as_ref(),
    )?);
    let url = args.cluster.into();
    let opts = CommitmentConfig::processed();
    let pid = multisig_lite::id();
    let program = Client::new_with_options(url, funder.clone(), opts).program(pid);

    // Gets the PDAs.
    let (state_pda, _state_bump) =
        Pubkey::find_program_address(&[b"state", funder.pubkey().as_ref()], &pid);
    let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b"fund", state_pda.as_ref()], &pid);

    // Temporary transfer keypair.
    //
    // This is only required for the transaction signature and
    // won't be required once the transaction is recorded on the
    // ledger.
    let transfer = Keypair::new();

    // Creates a pending transfer.
    let sig = program
        .request()
        .accounts(multisig_lite::accounts::CreateTransfer {
            creator: funder.pubkey(),
            state: state_pda,
            fund: fund_pda,
            transfer: transfer.pubkey(),
            system_program: system_program::id(),
        })
        .args(multisig_lite::instruction::CreateTransfer {
            recipient: Pubkey::new_unique(),
            lamports: args.lamports,
            fund_bump,
        })
        .signer(funder.as_ref())
        .signer(&transfer)
        .send()?;

    println!("{sig}");

    Ok(())
}
