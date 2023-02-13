//! `multisig_list::multisig_list::create_transfer` instruction tests.

use solana_sdk::hash::Hash;
use solana_sdk::native_token::LAMPORTS_PER_SOL;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use solana_sdk::system_program;
use solana_sdk::transaction::{Transaction, TransactionError};

#[tokio::test]
async fn create_transfer() {
    let mut tester = Tester::new().await;

    // Creates and funds the  multisig account.
    tester.create().await;
    tester.fund().await;

    // Then creates a transfer.
    let transfer = Keypair::new();
    let recipient = Pubkey::new_unique();
    let lamports = 2_000 * LAMPORTS_PER_SOL;
    assert!(tester
        .with_signature()
        .create_transfer(&transfer, recipient, lamports)
        .await
        .is_ok());
}

#[tokio::test]
async fn create_transfer_without_signature() {
    let mut tester = Tester::new().await;

    // Creates and funds the  multisig account.
    tester.create().await;
    tester.fund().await;

    let transfer = Keypair::new();
    let recipient = Pubkey::new_unique();
    let lamports = 10_000 * LAMPORTS_PER_SOL;
    let err = tester
        .create_transfer(&transfer, recipient, lamports)
        .await
        .err()
        .unwrap();
    assert_eq!(err.unwrap(), TransactionError::SignatureFailure);
}

struct Tester {
    program: anchor_client::Program,
    client: solana_program_test::BanksClient,
    funder: std::rc::Rc<Keypair>,
    recent_blockhash: Hash,
    with_signature: bool,
    m: u8,
    signers: Vec<Pubkey>,
    q: u8,
    state_pda: Pubkey,
    state_bump: u8,
    fund_pda: Pubkey,
    fund_bump: u8,
    lamports: u64,
}

impl Tester {
    async fn new() -> Self {
        let pid = multisig_lite::id();
        let (client, funder, recent_blockhash) = solana_program_test::ProgramTest::new(
            "multisig_lite",
            pid,
            solana_program_test::processor!(multisig_lite::entry),
        )
        .start()
        .await;

        // Wrap the founder keypair to be able to be passed to the anchor program.
        let funder = std::rc::Rc::new(funder);

        // Default 5 signers, including the funder.
        let signers = vec![
            funder.pubkey(),
            Pubkey::new_unique(),
            Pubkey::new_unique(),
            Pubkey::new_unique(),
            Pubkey::new_unique(),
        ];

        // Creates an anchor::Program for `solana_sdk::instruction::Instruction`s.
        let cluster = anchor_client::Cluster::Localnet;
        let program = anchor_client::Client::new(cluster, funder.clone()).program(pid);

        // Find PDAs.
        let (state_pda, state_bump) =
            Pubkey::find_program_address(&[b"state", (funder.pubkey().as_ref())], &pid);
        let (fund_pda, fund_bump) =
            Pubkey::find_program_address(&[b"fund", state_pda.as_ref()], &pid);

        Self {
            program,
            client,
            funder,
            recent_blockhash,
            with_signature: false,
            m: 3,
            signers,
            q: 10,
            state_pda,
            state_bump,
            fund_pda,
            fund_bump,
            lamports: 100_000 * LAMPORTS_PER_SOL, // 100k SOL!? :)
        }
    }

    fn with_signature(&mut self) -> &mut Self {
        self.with_signature = true;
        self
    }

    async fn create(&mut self) {
        let ixs = self
            .program
            .request()
            .accounts(multisig_lite::accounts::Create {
                funder: self.funder.pubkey(),
                state: self.state_pda,
                fund: self.fund_pda,
                system_program: system_program::id(),
            })
            .args(multisig_lite::instruction::Create {
                m: self.m,
                signers: self.signers.clone(),
                q: self.q,
                _state_bump: self.state_bump,
                fund_bump: self.fund_bump,
            })
            .instructions()
            .unwrap();

        let mut tx = Transaction::new_with_payer(&ixs, Some(&self.funder.pubkey()));
        tx.sign(&[self.funder.as_ref()], self.recent_blockhash);
        self.client.process_transaction(tx).await.unwrap();
    }

    async fn fund(&mut self) {
        let ixs = self
            .program
            .request()
            .accounts(multisig_lite::accounts::Fund {
                funder: self.funder.pubkey(),
                state: self.state_pda,
                fund: self.fund_pda,
                system_program: system_program::id(),
            })
            .args(multisig_lite::instruction::Fund {
                lamports: self.lamports,
                _state_bump: self.state_bump,
                fund_bump: self.fund_bump,
            })
            .instructions()
            .unwrap();

        let mut tx = Transaction::new_with_payer(&ixs, Some(&self.funder.pubkey()));
        tx.sign(&[self.funder.as_ref()], self.recent_blockhash);
        self.client.process_transaction(tx).await.unwrap();
    }

    async fn create_transfer(
        &mut self,
        transfer: &Keypair,
        recipient: Pubkey,
        lamports: u64,
    ) -> Result<(), solana_program_test::BanksClientError> {
        let ixs = self
            .program
            .request()
            .accounts(multisig_lite::accounts::CreateTransfer {
                creator: self.funder.pubkey(),
                state: self.state_pda,
                fund: self.fund_pda,
                transfer: transfer.pubkey(),
                system_program: system_program::id(),
            })
            .args(multisig_lite::instruction::CreateTransfer {
                recipient,
                lamports,
                fund_bump: self.fund_bump,
            })
            .instructions()
            .unwrap();

        let mut tx = Transaction::new_with_payer(&ixs, Some(&self.funder.pubkey()));
        if self.with_signature {
            tx.sign(&[self.funder.as_ref(), transfer], self.recent_blockhash);
        }
        self.client.process_transaction(tx).await
    }
}
