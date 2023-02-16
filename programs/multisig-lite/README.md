# multisig-lite

[![CI](https://github.com/keithnoguchi/multisig-lite/actions/workflows/ci.yml/badge.svg)](
https://github.com/keithnoguchi/multisig-lite/actions)
[![License](https://img.shields.io/badge/license-Apache--2.0_OR_MIT-blue.svg)](
https://github.com/keithnoguchi/multisig-lite)
[![Cargo](https://img.shields.io/crates/v/multisig-lite.svg)](
https://crates.io/crates/multisig-lite)
[![Documentation](https://docs.rs/multisig-lite/badge.svg)](
https://docs.rs/multisig-lite)
[![dApp](https://img.shields.io/badge/dApp-black.svg?logo=Vercel)](
https://multisig-lite.vercel.app)

[sol]: https://en.wikipedia.org/wiki/Solana_(blockchain_platform)
[multisig]: https://en.wikipedia.org/wiki/Cryptocurrency_wallet#Multisignature_wallet
[solana blockchain]: https://solana.com
[rust doc]: https://docs.rs/multisig-lite
[typescript test]: ../../tests/multisig-lite.ts

A native [SOL] [multisig] on-chain program for [Solana Blockchain].

Currently, there are five instructions to provide the queued multisig transfer operation:

1. [`create`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.create.html)
2. [`fund`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.fund.html)
3. [`create_transfer`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.create_transfer.html)
4. [`approve`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.approve.html)
5. [`close`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.close.html)

## Examples

[`multisig_lite::multisig_lite`]: https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/

Here is how to create a new multisig account on-chain.

Please refer to the [`multisig_lite::multisig_lite`] module level
documentation for the other instructions' example.

```
use std::rc::Rc;

use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::read_keypair_file;
use solana_sdk::signer::Signer;
use solana_sdk::system_program;

use anchor_client::{Client, Cluster};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = Cluster::Devnet;
    let funder = Rc::new(read_keypair_file(
        shellexpand::tilde("~/.config/solana/id.json").as_ref(),
    )?);
    let opts = CommitmentConfig::processed();
    let pid = multisig_lite::id();
    let program = Client::new_with_options(url, funder.clone(), opts).program(pid);

    // Gets the PDAs.
    let (state_pda, state_bump) =
        Pubkey::find_program_address(&[b"state", funder.pubkey().as_ref()], &pid);
    let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b"fund", state_pda.as_ref()], &pid);

    // Creates a multisig account.
    let sig = program
        .request()
        .accounts(multisig_lite::accounts::Create {
            funder: funder.pubkey(),
            state: state_pda,
            fund: fund_pda,
            system_program: system_program::id(),
        })
        .args(multisig_lite::instruction::Create {
            m: 2, // m as in m/n.
            signers: vec![funder.pubkey(), Pubkey::new_unique(), Pubkey::new_unique()],
            q: 10, // transfer queue limit.
            _state_bump: state_bump,
            fund_bump,
        })
        .signer(funder.as_ref())
        .send()?;

    Ok(())
}
```

## Test

[solana-program-test]: https://crates.io/crates/solana-program-test

You can run [solana-program-test] based functional tests with the standard
`cargo test` command:

```
$ cargo test
```

## License

Licensed under either of

 * Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

#### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
