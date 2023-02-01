//! A native [SOL] multisig on-chain program.
//!
//! [sol]: https://solana.com/

use std::collections::{HashMap, HashSet};
use std::ops::DerefMut;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::{invoke, invoke_signed};
use anchor_lang::solana_program::system_instruction;

declare_id!("2bhFGQZawKVEBpfhFAwAXDnd7mUCDJj6E5eYSJWfgzQ1");

/// A multisig program specific error code.
#[error_code]
pub enum Error {
    /// Multisig [`State`] queue is empty.
    #[msg("Multisig account is empty. Please create transactions")]
    AccountEmpty,

    /// Multisig [`State`] queue is full.
    #[msg("Multisig transaction queue is full. Please approve those.")]
    AccountFull,

    /// Multisig [`State`] account is locked.
    #[msg("Multisig account is locked. Please approve the transactions")]
    AccountLocked,

    /// Missing transfer recipient AccountInfo.
    #[msg("Missing transfer recipient AccountInfo")]
    MissingRecipientAccountInfo,

    /// Multisig `Fund` account is not writable.
    #[msg("Fund account is not writable")]
    FundAccountNotWritable,

    /// Multisig `Fund` account data is not empty")]
    #[msg("Fund account data is not empty")]
    FundAccountIsNotEmpty,

    /// Invalid Multisig `Fund` PDA.
    #[msg("Invalid fund account")]
    InvalidFundAddress,

    /// Invalid Multisig `Fund` account bump.
    #[msg("Invalid fund bump seed")]
    InvalidFundBumpSeed,

    /// No signers.
    #[msg("No signers provided")]
    NoSigners,

    /// Too many signers provided.
    #[msg("Too many signers provided")]
    TooManySigners,

    /// The threshold, e.g. `m`, is too high.
    #[msg("Threshold too high")]
    ThresholdTooHigh,

    /// Invalid signer given.
    #[msg("Invalid signer")]
    InvalidSigner,

    /// Not enough `Fund` balance.
    #[msg("There is not enough fund balance")]
    NotEnoughFundBalance,
}

/// A multisig [`State`] PDA account data.
#[account]
pub struct State {
    /// A threshold.
    pub m: u8,

    /// An array of signers Pubkey.
    pub signers: Vec<Pubkey>,

    /// A current signed state.
    pub signed: Vec<bool>,

    /// A fund PDA account, holding the native SOL.
    pub fund: Pubkey,

    /// A balance of the fund in lamports.
    pub balance: u64,

    /// A maximum pending transactions.
    pub q: u8,

    /// An array of the pending transactions.
    pub queue: Vec<Pubkey>,
}

impl State {
    /// A minimum signers.
    const MIN_SIGNERS: u8 = 1;

    /// A maximum signers.
    const MAX_SIGNERS: u8 = u8::MAX;

    /// A maximum transaction queue.
    const MIN_QUEUE: u8 = 1;

    /// A maximum transaction queue.
    const MAX_QUEUE: u8 = u8::MAX;

    fn space(signers: &[Pubkey], q: u8) -> usize {
        let n = Self::valid_n(signers.len() as u8) as usize;
        let q = Self::valid_q(q) as usize;
        8 + 1 + 4 + 32 * n + 4 + n + 32 + 8 + 1 + 4 + 32 * q
    }

    /// Returns the valid n, number of signers.
    fn valid_n(n: u8) -> u8 {
        n.min(Self::MAX_SIGNERS).max(Self::MIN_SIGNERS)
    }

    /// Returns the valid q, queue length.
    fn valid_q(q: u8) -> u8 {
        q.min(Self::MAX_QUEUE).max(Self::MIN_QUEUE)
    }

    /// Checks if the transfer queue is empty.
    fn is_empty(&self) -> bool {
        self.queue.is_empty()
    }

    /// Check if the multisig queue is full.
    fn is_full(&self) -> bool {
        self.queue.len() == self.q as usize
    }

    /// Checks if the account had been locked.
    ///
    /// The multisig account is locked once it's signed
    /// by anyone.  It will be unlocked once the current
    /// pending transactions were completed.
    fn is_locked(&self) -> bool {
        self.signed.iter().any(|signed| *signed)
    }

    /// Validates the multisig queue.
    fn validate_queue(&self) -> Result<()> {
        require!(!self.is_full(), Error::AccountFull);
        Ok(())
    }

    /// Validates the multisig fund account.
    fn validate_fund<'info>(
        state: &Account<'info, Self>,
        fund: &UncheckedAccount<'info>,
        bump: u8,
    ) -> Result<()> {
        if !fund.is_writable {
            Err(Error::FundAccountNotWritable)?;
        }
        if !fund.data_is_empty() {
            Err(Error::FundAccountIsNotEmpty)?;
        }
        let state_key = state.key();
        let seed = [b"fund", state_key.as_ref(), &[bump]];
        let pda = match Pubkey::create_program_address(&seed, &id()) {
            Err(_e) => Err(Error::InvalidFundBumpSeed)?,
            Ok(pda) => pda,
        };
        require_keys_eq!(pda, fund.key(), Error::InvalidFundAddress);

        Ok(())
    }

    /// Creates a fund account.
    fn create_fund_account<'info>(
        state: &Account<'info, Self>,
        fund: &UncheckedAccount<'info>,
        funder: &Signer<'info>,
        bump: u8,
    ) -> Result<()> {
        let lamports = Rent::get()?.minimum_balance(0);
        let ix = system_instruction::create_account(&funder.key(), &fund.key(), lamports, 0, &id());
        let state_key = state.key();
        let accounts = [funder.to_account_info(), fund.to_account_info()];
        let seed = [b"fund", state_key.as_ref(), &[bump]];

        // CPI.
        invoke_signed(&ix, &accounts, &[&seed])?;

        Ok(())
    }

    /// Withdraw fund.
    fn transfer_fund<'a, 'b, 'c>(
        _state: &Account<'a, Self>,
        from: &AccountInfo<'b>,
        to: &AccountInfo<'c>,
        lamports: u64,
        _bump: u8,
    ) -> Result<()> {
        // The following code hit the runtime error, [`InstructionError::ExternalLamportSpend`].
        // Instead, we'll transfer the lamports natively,
        // as suggested by the [Solana cookbook].
        //
        // [`InstructionError::ExternalLamportSpend`]: https://docs.rs/solana-program/latest/solana_program/instruction/enum.InstructionError.html#variant.ExternalAccountLamportSpend
        // [solana cookbook]: https://solanacookbook.com/references/programs.html#how-to-transfer-sol-in-a-program

        /*
        let ix = system_instruction::transfer(from.key, &to.key, lamports);
        let accounts = [from, to];
        let state_key = state.key();
        let seed = [b"fund", state_key.as_ref(), &[bump]];
        invoke_signed(
            &ix,
            &accounts,
            &[&seed],
        )?;
        */
        **from.try_borrow_mut_lamports()? -= lamports;
        **to.try_borrow_mut_lamports()? += lamports;

        Ok(())
    }
}

/// A multisig [`Transfer`] account data.
#[account]
pub struct Transfer {
    /// An creator of the transfer, one of the multisig
    /// signers.
    creator: Pubkey,

    /// A recipient of the transfer.
    recipient: Pubkey,

    /// A lamports to transfer.
    lamports: u64,
}

impl Transfer {
    const SPACE: usize = 8 + 32 + 32 + 8;
}

/// Accounts for the [`multisig_lite::create`] instruction handler.
#[derive(Accounts)]
#[instruction(m: u8, signers: Vec<Pubkey>, q: u8, state_bump: u8, fund_bump: u8)]
pub struct Create<'info> {
    /// A funder of the multisig account.
    #[account(mut)]
    pub funder: Signer<'info>,

    /// A multisig state PDA account.
    #[account(
        init,
        payer = funder,
        space = State::space(&signers, q),
        seeds = [b"state", funder.key.as_ref()],
        bump,
    )]
    pub state: Account<'info, State>,

    /// A multisig fund account.
    ///
    /// CHECK: Checked by the [`multisig_lite::create`] instruction handler.
    #[account(mut, seeds = [b"fund", state.key().as_ref()], bump = fund_bump)]
    pub fund: UncheckedAccount<'info>,

    /// The system program to create a multisig PDA accounts.
    pub system_program: Program<'info, System>,
}

/// Accounts for the [`multisig_lite::fund`] instruction handler.
#[derive(Accounts)]
#[instruction(lamports: u64, state_bump: u8, fund_bump: u8)]
pub struct Fund<'info> {
    /// A funder of the account.
    ///
    /// The funding is only allowed by the multisig account creator.
    #[account(mut)]
    pub funder: Signer<'info>,

    /// A multisig state PDA account.
    #[account(mut, seeds = [b"state", funder.key.as_ref()], bump = state_bump)]
    pub state: Box<Account<'info, State>>,

    /// A multisig fund account.
    ///
    /// CHECK: Checked by the [`multisig_lite::fund`] instruction handler.
    #[account(mut, seeds = [b"fund", state.key().as_ref()], bump = fund_bump)]
    pub fund: UncheckedAccount<'info>,

    /// The system program to make the transfer of the funds.
    pub system_program: Program<'info, System>,
}

/// Accounts for the [`multisig_lite::create_transfer`] instruction handler.
#[derive(Accounts)]
#[instruction(recipient: Pubkey, lamports: u64, fund_bump: u8)]
pub struct CreateTransfer<'info> {
    /// An initiator of the fund transfer.
    ///
    /// It should be one of the signers of the multisig account.
    #[account(mut)]
    pub creator: Signer<'info>,

    /// A multisig state PDA account.
    #[account(mut)]
    pub state: Box<Account<'info, State>>,

    /// A multisig fund PDA account.
    ///
    /// CHECK: Checked by the [`multisig_lite::create_transfer`] instruction handler.
    #[account(mut, seeds = [b"fund", state.key().as_ref()], bump = fund_bump)]
    pub fund: UncheckedAccount<'info>,

    /// A transfer account to keep the queued transfer info.
    #[account(init, payer = creator, space = Transfer::SPACE)]
    pub transfer: Account<'info, Transfer>,

    /// The system program to create a transfer account.
    pub system_program: Program<'info, System>,
}

/// Accounts for the [`multisig_lite::approve`] instruction handler.
///
/// Once one of the signer approves, the account is locked
/// for the new transfer unless:
///
/// 1) Meets the m number of signers approval.
/// 2) Closes the account.
///
/// In case of the 1 above, the account will be unlocked
/// and starts to take a new transfer again.
#[derive(Accounts)]
#[instruction(fund_bump: u8)]
pub struct Approve<'info> {
    /// An approver of the current state of the multisg account.
    #[account(mut)]
    pub signer: Signer<'info>,

    /// A multisig state PDA account.
    #[account(mut)]
    pub state: Box<Account<'info, State>>,

    /// A multisig fund account.
    ///
    /// CHECK: Checked by the [`multisig_lite::approve`] instruction handler.
    #[account(mut, seeds = [b"fund", state.key().as_ref()], bump = fund_bump)]
    pub fund: UncheckedAccount<'info>,

    /// The system program to create a transfer account.
    pub system_program: Program<'info, System>,
}

/// Accounts for the [`multisig_lite::close`] instruction handler.
#[derive(Accounts)]
#[instruction(state_bump: u8, fund_bump: u8)]
pub struct Close<'info> {
    /// An original funder of the multisig account.
    #[account(mut)]
    pub funder: Signer<'info>,

    /// A multisig state PDA account.
    #[account(mut, close = funder, seeds = [b"state", funder.key.as_ref()], bump = state_bump)]
    pub state: Box<Account<'info, State>>,

    /// A multisig fund PDA account.
    ///
    /// CHECK: Checked by the [`multisig_lite::close`] instruction handler.
    #[account(mut, seeds = [b"fund", state.key().as_ref()], bump = fund_bump)]
    pub fund: UncheckedAccount<'info>,

    /// The system program to transfer back the fund.
    pub system_program: Program<'info, System>,
}

/// Module representing the program instruction handlers.
#[program]
pub mod multisig_lite {
    use super::*;

    /// Creates the multisig account.
    ///
    /// It's restricted one multisig account to each funder Pubkey,
    /// as it's used for the multisig PDA address generation.
    pub fn create(
        ctx: Context<Create>,
        m: u8,
        signers: Vec<Pubkey>,
        q: u8,
        _state_bump: u8,
        fund_bump: u8,
    ) -> Result<()> {
        let funder = &mut ctx.accounts.funder;
        let state = &mut ctx.accounts.state;
        let fund = &mut ctx.accounts.fund;

        // Validate the multisig fund account.
        State::validate_fund(&state, &fund, fund_bump)?;

        // Checks the uniqueness of signer's address.
        let signers: HashSet<_> = signers.into_iter().collect();
        require_gte!(signers.len(), State::MIN_SIGNERS as usize, Error::NoSigners,);
        require_gte!(
            State::MAX_SIGNERS as usize,
            signers.len(),
            Error::TooManySigners
        );

        let threshold = m as usize;
        require_gte!(signers.len(), threshold, Error::ThresholdTooHigh);

        // Creates a fund account.
        State::create_fund_account(&state, &fund, &funder, fund_bump)?;

        // Initializes the multisig state account.
        state.m = m;
        state.signers = signers.into_iter().collect();
        state.signed = vec![false; state.signers.len()];
        state.fund = fund.key();
        state.balance = 0;
        state.q = State::valid_q(q);

        Ok(())
    }

    /// Funds lamports to the multisig account.
    ///
    /// The funding is only allowed by the multisig account funder.
    pub fn fund(ctx: Context<Fund>, lamports: u64, _staet_bump: u8, fund_bump: u8) -> Result<()> {
        let funder = &ctx.accounts.funder;
        let state = &mut ctx.accounts.state;
        let fund = &mut ctx.accounts.fund;

        // Validate the multisig fund account.
        State::validate_fund(&state, &fund, fund_bump)?;

        // CPI to transfer fund to the multisig fund account.
        let ix = system_instruction::transfer(&funder.key(), &fund.key(), lamports);
        let accounts = [funder.to_account_info(), fund.to_account_info()];
        invoke(&ix, &accounts)?;

        // Update the balance.
        state.balance += lamports;

        Ok(())
    }

    /// Creates a queued transfer lamports to the recipient.
    ///
    /// Transfer account creation fee will be given back to the
    /// creator of the transfer from the multisig fund.
    pub fn create_transfer(
        ctx: Context<CreateTransfer>,
        recipient: Pubkey,
        lamports: u64,
        fund_bump: u8,
    ) -> Result<()> {
        let creator = &ctx.accounts.creator;
        let state = &mut ctx.accounts.state;
        let fund = &mut ctx.accounts.fund;
        let transfer = &mut ctx.accounts.transfer;

        // Checks if the account is locked.
        require!(!state.is_locked(), Error::AccountLocked);

        // Validate the multisig fund account.
        State::validate_fund(&state, &fund, fund_bump)?;

        // Checks the creator.
        let creator_key = creator.key();
        let signers = &state.signers;
        require!(signers.contains(&creator_key), Error::InvalidSigner);

        // Check the current transfer queue.
        state.validate_queue()?;

        // Checks the multisig fund balance.
        require_gte!(state.balance, lamports, Error::NotEnoughFundBalance);

        // Giving back the rent fee to the creator.
        let from = fund.to_account_info();
        let to = creator.to_account_info();
        let rent = transfer.to_account_info().lamports();
        State::transfer_fund(&state, &from, &to, rent, fund_bump)?;

        // Initializes the transfer account, and
        // queue it under multisig account for the
        // future transfer execution.
        transfer.creator = creator_key;
        transfer.recipient = recipient;
        transfer.lamports = lamports;
        state.balance -= lamports;
        state.queue.push(transfer.key());

        Ok(())
    }

    /// Approves the transactions and executes the transfer
    /// in case m approvals are met.
    pub fn approve(ctx: Context<Approve>, fund_bump: u8) -> Result<()> {
        let signer = &ctx.accounts.signer;
        let state = &mut ctx.accounts.state;
        let fund = &mut ctx.accounts.fund;
        let remaining_accounts: HashMap<_, _> = ctx
            .remaining_accounts
            .iter()
            .map(|account| (account.key, account))
            .collect();

        // Validate the multisig fund account.
        State::validate_fund(&state, &fund, fund_bump)?;

        // Nothing to approve.
        require!(!state.is_empty(), Error::AccountEmpty);

        // Checks the signer.
        let signer_key = signer.key();
        let signers = &state.signers;
        let signer_index = match signers.iter().position(|pubkey| *pubkey == signer_key) {
            None => return Err(Error::InvalidSigner.into()),
            Some(signer_index) => signer_index,
        };

        // Due to the single transaction limitation, we allow the multiple approval
        // so that we take care of the transfer in batch.
        if !state.signed[signer_index] {
            state.signed[signer_index] = true;
        }

        // Checks the threshold.
        let signed = state.signed.iter().filter(|&signed| *signed).count() as u8;
        if signed < state.m {
            return Ok(());
        }

        // Finds out the executable transactions.
        let mut executable = Vec::new();
        let mut remaining = Vec::new();
        for transfer_addr in &state.queue {
            let transfer_info = match remaining_accounts.get(transfer_addr) {
                Some(transfer) => transfer,
                None => {
                    remaining.push(*transfer_addr);
                    continue;
                }
            };
            let mut ref_data = transfer_info.try_borrow_mut_data()?;
            let mut transfer_data: &[u8] = ref_data.deref_mut();
            let tx = Transfer::try_deserialize(&mut transfer_data)?;
            let to = match remaining_accounts.get(&tx.recipient) {
                None => return Err(Error::MissingRecipientAccountInfo.into()),
                Some(recipient) => recipient,
            };
            executable.push((transfer_info, to, tx.lamports));
        }

        // There is no executable account info.  Just returns the success.
        //
        // This is a case that the approver approved the multisig but didn't
        // provide the account info.
        if executable.is_empty() {
            return Ok(());
        }

        // Executes the queued transfers.
        let fund = fund.to_account_info();
        for (transfer, to, lamports) in executable {
            // Fund to the recipient and closes the transfer account.
            State::transfer_fund(&state, &fund, &to, lamports, fund_bump)?;
            let lamports = transfer.lamports();
            State::transfer_fund(&state, &transfer, &fund, lamports, fund_bump)?;
        }

        // Update the queue.
        state.queue = remaining;

        // Reset the signed status once the queue is empty.
        if State::is_empty(&state) {
            state.signed.iter_mut().for_each(|signed| *signed = false);
        }

        Ok(())
    }

    /// Closes a multisig account.
    ///
    /// It cleans up all the remaining accounts and return back to the
    /// funder.
    pub fn close(ctx: Context<Close>, _state_bump: u8, fund_bump: u8) -> Result<()> {
        let funder = &mut ctx.accounts.funder;
        let state = &mut ctx.accounts.state;
        let fund = &mut ctx.accounts.fund;
        let remaining_accounts: HashMap<_, _> = ctx
            .remaining_accounts
            .iter()
            .map(|account| (account.key, account))
            .collect();

        // Validate the multisig fund account.
        State::validate_fund(&state, &fund, fund_bump)?;

        // Closes the transfer accounts by transfering the
        // rent fee back to the fund account.
        let to = fund.to_account_info();
        for transfer_addr in &state.queue {
            let from = match remaining_accounts.get(transfer_addr) {
                Some(transfer) => transfer,
                None => continue,
            };
            let lamports = from.lamports();
            State::transfer_fund(&state, &from, &to, lamports, fund_bump)?;
        }

        // Closes the multisig fund account by transfering all the lamports
        // back to the funder.
        let from = fund.to_account_info();
        let to = funder.to_account_info();
        let lamports = fund.lamports();
        State::transfer_fund(&state, &from, &to, lamports, fund_bump)?;

        Ok(())
    }
}
