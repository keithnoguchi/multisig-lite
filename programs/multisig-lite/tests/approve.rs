//! `multisig_list::multisig_list::approve` instruction tests.

use solana_sdk::commitment_config::CommitmentLevel;
use solana_sdk::hash::Hash;
use solana_sdk::instruction::AccountMeta;
use solana_sdk::native_token::LAMPORTS_PER_SOL;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signer::keypair::Keypair;
use solana_sdk::signer::Signer;
use solana_sdk::system_program;
use solana_sdk::transaction::{Transaction, TransactionError};

use anchor_client::anchor_lang::AccountDeserialize;

#[tokio::test]
async fn approve() {
    let mut tester = Tester::new().await;

    // Creates, funds, and creates transfers on the multisig account.
    tester.create().await;
    tester.fund().await;
    tester.create_transfers().await;

    // Then approves the transfers.
    assert!(tester.with_signature().approve().await.is_ok());
}

#[tokio::test]
async fn approve_without_signature() {
    let mut tester = Tester::new().await;

    // Creates, funds, and creates transfers on the multisig account.
    tester.create().await;
    tester.fund().await;
    tester.create_transfers().await;

    let err = tester.approve().await.err().unwrap();
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
    transfers: Vec<TestTransfer>,
}

struct TestTransfer {
    transfer: Keypair,
    recipient: Pubkey,
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

        // Transfers.
        let mut transfers = vec![];
        (0..10).for_each(|i| {
            transfers.push(TestTransfer {
                transfer: Keypair::new(),
                recipient: Pubkey::new_unique(),
                lamports: i as u64 * LAMPORTS_PER_SOL,
            })
        });

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
            transfers,
        }
    }

    fn with_signature(&mut self) -> &mut Self {
        self.with_signature = true;
        self
    }

    async fn get_state_account(&mut self) -> multisig_lite::State {
        self.client
            .get_account_with_commitment(self.state_pda, CommitmentLevel::Processed)
            .await
            .unwrap()
            .map(|account| {
                let mut data: &[u8] = &account.data;
                multisig_lite::State::try_deserialize(&mut data).unwrap()
            })
            .unwrap()
    }

    async fn get_transfer_account(&mut self, key: Pubkey) -> multisig_lite::Transfer {
        self.client
            .get_account_with_commitment(key, CommitmentLevel::Processed)
            .await
            .unwrap()
            .map(|account| {
                let mut data: &[u8] = &account.data;
                multisig_lite::Transfer::try_deserialize(&mut data).unwrap()
            })
            .unwrap()
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

    async fn create_transfers(&mut self) {
        let mut signers = vec![self.funder.as_ref()];
        let mut ixs = vec![];
        self.transfers.iter().for_each(|transfer| {
            signers.push(&transfer.transfer);
            ixs.extend(
                self.program
                    .request()
                    .accounts(multisig_lite::accounts::CreateTransfer {
                        creator: self.funder.pubkey(),
                        state: self.state_pda,
                        fund: self.fund_pda,
                        transfer: transfer.transfer.pubkey(),
                        system_program: system_program::id(),
                    })
                    .args(multisig_lite::instruction::CreateTransfer {
                        recipient: transfer.recipient,
                        lamports: transfer.lamports,
                        fund_bump: self.fund_bump,
                    })
                    .instructions()
                    .unwrap(),
            );
        });

        let mut tx = Transaction::new_with_payer(&ixs, Some(&self.funder.pubkey()));
        tx.sign(&signers, self.recent_blockhash);
        self.client.process_transaction(tx).await.unwrap();
    }

    async fn approve(&mut self) -> Result<(), solana_program_test::BanksClientError> {
        // Gets the pending transfers and the recipients account info.
        let mut remaining_accounts = vec![];
        let state = self.get_state_account().await;
        for transfer_pubkey in state.queue {
            let transfer = self.get_transfer_account(transfer_pubkey).await;

            // Pushes the transfer account.
            remaining_accounts.push(AccountMeta {
                pubkey: transfer_pubkey,
                is_signer: false,
                is_writable: true,
            });

            // Pushes the recipient account.
            remaining_accounts.push(AccountMeta {
                pubkey: transfer.recipient,
                is_signer: false,
                is_writable: true,
            });
        }

        let ixs = self
            .program
            .request()
            .accounts(multisig_lite::accounts::Approve {
                signer: self.funder.pubkey(),
                state: self.state_pda,
                fund: self.fund_pda,
            })
            .args(multisig_lite::instruction::Approve {
                fund_bump: self.fund_bump,
            })
            .accounts(remaining_accounts)
            .instructions()
            .unwrap();

        let mut tx = Transaction::new_with_payer(&ixs, Some(&self.funder.pubkey()));
        if self.with_signature {
            tx.sign(&[self.funder.as_ref()], self.recent_blockhash);
        }
        self.client.process_transaction(tx).await
    }
}
