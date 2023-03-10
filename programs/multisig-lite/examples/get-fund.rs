//! `multisig_list` Fund account query example.
//!
//! Run with:
//! ```
//! cargo run --example get-fund
//! ```

use std::error::Error;
use std::rc::Rc;

use clap::{Parser, ValueEnum};
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::read_keypair_file;
use solana_sdk::signer::Signer;

use anchor_client::{Client, Cluster};

#[derive(Debug, Parser)]
struct Args {
    /// A Solana cluster.
    #[arg(short, long, value_enum, default_value_t = ClusterArg::Localnet)]
    cluster: ClusterArg,
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
    let (fund_pda, _fund_bump) = Pubkey::find_program_address(&[b"fund", state_pda.as_ref()], &pid);

    // Query the Fund account.
    let fund = program.rpc().get_account(&fund_pda)?;

    println!("{fund:?}");

    Ok(())
}
