//! `multisig_list::State` unit tests.

use anchor_lang::solana_program::pubkey::Pubkey;

use multisig_lite::State;

#[test]
fn state_space() {
    let signers = vec![Pubkey::default(), Pubkey::default()];
    let q = 100;
    assert_eq!(State::space(&signers, q), 3328);
}

#[test]
fn state_valid_n() {
    (1_u8..255).for_each(|n| assert_eq!(State::valid_n(n), n));
}

#[test]
fn state_valid_q() {
    (1_u8..255).for_each(|n| assert_eq!(State::valid_q(n), n));
}
