//! `multisig_list::Transfer` query example.
//!
//! Run with:
//! ```
//! cargo run --example get-transfers
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

    // Query the `multisig_lite::State` account to get the queued transfers.
    let state: multisig_lite::State = program.account(state_pda)?;

    // Query the `multisig_lite::Transfer` accounts iteratively.
    for transfer in state.queue {
        let transfer: multisig_lite::Transfer = program.account(transfer)?;
        println!("{transfer:?}");
    }

    Ok(())
}
