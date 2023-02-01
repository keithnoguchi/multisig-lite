//! A native SOL multisig program.

use anchor_lang::prelude::*;

declare_id!("2bhFGQZawKVEBpfhFAwAXDnd7mUCDJj6E5eYSJWfgzQ1");

#[program]
pub mod multisig_lite {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
