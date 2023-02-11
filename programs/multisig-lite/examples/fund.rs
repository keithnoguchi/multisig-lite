//! `multisig_list::multisig_list::fund` instruction example.
//!
//! Run with:
//! ```
//! cargo run --example fund
//! ```

use std::error::Error;
use std::rc::Rc;

use clap::{Parser, ValueEnum};
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::read_keypair_file;
use solana_sdk::signer::Signer;
use solana_sdk::system_program;

use anchor_client::{Client, Cluster};

#[derive(Debug, Parser)]
struct Args {
    /// A Solana cluster.
    #[arg(short, long, value_enum, default_value_t = ClusterArg::Localnet)]
    cluster: ClusterArg,

    /// Lamports to fund to the multisig fund account, 0.05SOL by default.
    #[arg(short, long, default_value_t = 50_000_000)]
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

    // Funds the multisig account.
    let sig = program
        .request()
        .accounts(multisig_lite::accounts::Fund {
            funder: funder.pubkey(),
            state: state_pda,
            fund: fund_pda,
            system_program: system_program::id(),
        })
        .args(multisig_lite::instruction::Fund {
            lamports: args.lamports,
            _state_bump,
            fund_bump,
        })
        .signer(funder.as_ref())
        .send()?;

    println!("{sig}");

    Ok(())
}
