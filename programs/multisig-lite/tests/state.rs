//! `multisig_list::State` unit tests.

use std::error::Error;

use multisig_lite::State;

#[test]
fn state_validate_queue() -> Result<(), Box<dyn Error>> {
    let mut state = State::default();
    state.q = 1;
    state.validate_queue()?;
    Ok(())
}
