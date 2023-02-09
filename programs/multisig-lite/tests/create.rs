//! `multisig_list::State` unit tests.

use std::error::Error;
use std::rc::Rc;

use solana_program_test::ProgramTest;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::Signer;
use solana_sdk::system_program;
use solana_sdk::transaction::Transaction;

#[tokio::test]
async fn create() -> Result<(), Box<dyn Error>> {
    // Starts the on-chain program first.
    let (mut banks_client, funder, recent_blockhash) =
        ProgramTest::new("multisig_lite", multisig_lite::id(), None)
            .start()
            .await;

    // Wrap it to be shared with anchor_client.
    let funder = Rc::new(funder);

    // Creates a anchor::Program for `solana_sdk::instruction::Instruction`s.
    let program = anchor_client::Client::new(anchor_client::Cluster::Localnet, funder.clone())
        .program(multisig_lite::id());

    assert_eq!(funder.pubkey(), program.payer());

    // Calculates the PDAs.
    let (state_pda, _state_bump) =
        Pubkey::find_program_address(&[b"state", funder.pubkey().as_ref()], &multisig_lite::id());
    let (fund_pda, _fund_bump) =
        Pubkey::find_program_address(&[b"fund", state_pda.as_ref()], &multisig_lite::id());

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

    println!("{ixs:?}");

    let mut tx = Transaction::new_with_payer(&ixs, Some(&funder.pubkey()));
    tx.sign(&[funder.as_ref()], recent_blockhash);

    banks_client.process_transaction(tx).await?;

    Ok(())
}
