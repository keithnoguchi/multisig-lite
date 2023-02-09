//! `multisig_list::State` unit tests.

use std::error::Error;
use std::rc::Rc;

use solana_program_test::{processor, BanksClient, ProgramTest};
use solana_sdk::hash::Hash;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::{keypair::Keypair, Signer};
use solana_sdk::system_program;
use solana_sdk::transaction::Transaction;

use anchor_client::Program;

#[tokio::test]
async fn create_with_signature() -> Result<(), Box<dyn Error>> {
    let (mut client, funder, blockhash, program) = Tester::new().start().await;

    // Gets the PDAs.
    let (state_pda, state_bump) = Tester::state_pda(&funder.pubkey());
    let (fund_pda, fund_bump) = Tester::fund_pda(&state_pda);

    // Creates a transaction.
    let mut tx = program
        .request()
        .accounts(multisig_lite::accounts::Create {
            funder: funder.pubkey(),
            state: state_pda,
            fund: fund_pda,
            system_program: system_program::id(),
        })
        .args(multisig_lite::instruction::Create {
            m: 2,
            signers: vec![funder.pubkey(), Pubkey::default(), Pubkey::default()],
            q: 10,
            _state_bump: state_bump,
            fund_bump,
        })
        .signer(funder.as_ref())
        .transaction()?;

    // Sends the transaction.
    tx.sign(&[funder.as_ref()], blockhash);
    client.process_transaction(tx).await?;

    // Queries the state account.
    let state_info = client.get_account(state_pda).await?;

    // Queries the fund account.
    let fund_info = client.get_account(fund_pda).await?;

    println!("{state_pda} {state_info:?} {fund_info:?}");

    Ok(())
}

#[tokio::test]
async fn create_without_signature() -> Result<(), Box<dyn Error>> {
    let (mut client, funder, _blockhash, program) = Tester::new().start().await;

    // Gets the PDAs.
    let (state_pda, _state_bump) = Tester::state_pda(&funder.pubkey());
    let (fund_pda, _fund_bump) = Tester::fund_pda(&state_pda);

    // Creates a transaction.
    let ixs = program
        .request()
        .accounts(multisig_lite::accounts::Create {
            funder: funder.pubkey(),
            state: state_pda,
            fund: fund_pda,
            system_program: system_program::id(),
        })
        .instructions()?;

    // Sends the transaction.
    let tx = Transaction::new_with_payer(&ixs, Some(&funder.pubkey()));
    assert!(client.process_transaction(tx).await.is_err());

    Ok(())
}

struct Tester(ProgramTest);

impl Tester {
    fn new() -> Self {
        Self(ProgramTest::new(
            "multisig_lite",
            multisig_lite::id(),
            processor!(multisig_lite::entry),
        ))
    }

    async fn start(self) -> (BanksClient, Rc<Keypair>, Hash, Program) {
        // Starts up the on-chain program.
        let (banks_client, funder, recent_blockhash) = self.0.start().await;

        // Wrap it to be shared with anchor_client.
        let funder = Rc::new(funder);

        // Creates a anchor::Program for `solana_sdk::instruction::Instruction`s.
        let program = anchor_client::Client::new(anchor_client::Cluster::Localnet, funder.clone())
            .program(multisig_lite::id());

        (banks_client, funder, recent_blockhash, program)
    }

    fn state_pda(funder: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"state", funder.as_ref()], &multisig_lite::id())
    }

    fn fund_pda(state: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"fund", state.as_ref()], &multisig_lite::id())
    }
}
