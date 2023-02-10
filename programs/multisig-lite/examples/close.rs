//! `multisig_list::multisig_list::close` instruction example.

use std::error::Error;
use std::rc::Rc;

use clap::{Parser, ValueEnum};
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::instruction::AccountMeta;
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
    let (state_pda, state_bump) =
        Pubkey::find_program_address(&[b"state", funder.pubkey().as_ref()], &pid);
    let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b"fund", state_pda.as_ref()], &pid);

    // Gets the remaining transfers to collects the rents.
    let state: multisig_lite::State = program.account(state_pda)?;
    let remaining_accounts: Vec<_> = state.queue.into_iter().map(|pubkey| AccountMeta {
        pubkey,
        is_signer: false,
        is_writable: true,
    }).collect();

    // Closes the multisig account.
    let sig = program
        .request()
        .accounts(multisig_lite::accounts::Close {
            funder: funder.pubkey(),
            state: state_pda,
            fund: fund_pda,
        })
        .args(multisig_lite::instruction::Close {
            _state_bump: state_bump,
            fund_bump: fund_bump,
        })
        .accounts(remaining_accounts)
        .signer(funder.as_ref())
        .send()?;

    println!("{sig}");

    Ok(())
}
