//! `multisig_list::State` unit tests.

use std::rc::Rc;

use solana_program_test::ProgramTest;
use solana_sdk::signer::Signer;
use solana_sdk::transaction::Transaction;

#[tokio::test]
async fn create() {
    // Starts the on-chain program first.
    let (mut _banks_client, funder, _recent_blockhash) =
        ProgramTest::new("multisig_lite", multisig_lite::id(), None)
            .start()
            .await;

    // Wrap it to be shared with anchor_client.
    let funder = Rc::new(funder);

    // Creates a anchor::Program for `solana_sdk::instruction::Instruction`s.
    let program = anchor_client::Client::new(anchor_client::Cluster::Localnet, funder.clone())
        .program(multisig_lite::id());

    assert_eq!(funder.pubkey(), program.payer());
}
