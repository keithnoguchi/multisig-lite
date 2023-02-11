//! `multisig_list::multisig_list::create` instruction tests.

use solana_sdk::account::Account;
use solana_sdk::hash::Hash;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use solana_sdk::system_program;
use solana_sdk::transaction::Transaction;

#[tokio::test]
async fn create() {
    let mut tester = CreateTester::new().await;
    tester.with_signature().process_transaction().await.unwrap();

    // Queries the state account.
    let state_info = tester.get_state_account().await;
    // Queries the fund account.
    let fund_info = tester.get_fund_account().await;

    println!("{state_info:?}, {fund_info:?}");
}

#[tokio::test]
async fn create_with_zero_threshold() {
    let got = CreateTester::new()
        .await
        .with_m(0)
        .with_signature()
        .process_transaction()
        .await;

    assert!(got.is_err());
}

#[tokio::test]
async fn create_without_signature() {
    let got = CreateTester::new().await.process_transaction().await;

    assert!(got.is_err());
}

struct CreateTester {
    program: anchor_client::Program,
    client: solana_program_test::BanksClient,
    funder: std::rc::Rc<Keypair>,
    recent_blockhash: Hash,
    with_signature: bool,
    m: u8,
    q: u8,
    state_pda: Pubkey,
    state_bump: u8,
    fund_pda: Pubkey,
    fund_bump: u8,
}

impl CreateTester {
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

        // Creates an anchor::Program for `solana_sdk::instruction::Instruction`s.
        let cluster = anchor_client::Cluster::Localnet;
        let program = anchor_client::Client::new(cluster, funder.clone()).program(pid);

        // Find PDAs.
        let (state_pda, state_bump) =
            Pubkey::find_program_address(&[b"state", &funder.pubkey().as_ref()], &pid);
        let (fund_pda, fund_bump) =
            Pubkey::find_program_address(&[b"fund", state_pda.as_ref()], &pid);

        Self {
            program,
            client,
            funder,
            recent_blockhash,
            with_signature: false,
            m: 2,
            q: 10,
            state_pda,
            state_bump,
            fund_pda,
            fund_bump,
        }
    }

    fn with_m(&mut self, m: u8) -> &mut Self {
        self.m = m;
        self
    }

    fn with_signature(&mut self) -> &mut Self {
        self.with_signature = true;
        self
    }

    async fn get_state_account(&mut self) -> Option<Account> {
        self.client.get_account(self.state_pda).await.unwrap()
    }

    async fn get_fund_account(&mut self) -> Option<Account> {
        self.client.get_account(self.fund_pda).await.unwrap()
    }

    async fn process_transaction(&mut self) -> Result<(), solana_program_test::BanksClientError> {
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
                signers: vec![
                    self.funder.pubkey(),
                    Pubkey::new_unique(),
                    Pubkey::new_unique(),
                ],
                q: self.q,
                _state_bump: self.state_bump,
                fund_bump: self.fund_bump,
            })
            .instructions()
            .unwrap();

        let mut tx = Transaction::new_with_payer(&ixs, Some(&self.funder.pubkey()));
        if self.with_signature {
            tx.sign(&[self.funder.as_ref()], self.recent_blockhash);
        }
        self.client.process_transaction(tx).await
    }
}
