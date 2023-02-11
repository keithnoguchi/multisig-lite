# multisig-lite

[![CI](https://github.com/keithnoguchi/multisig-lite/actions/workflows/ci.yml/badge.svg)](
https://github.com/keithnoguchi/multisig-lite/actions)
[![License](https://img.shields.io/badge/license-Apache--2.0_OR_MIT-blue.svg)](
https://github.com/keithnoguchi/multisig-lite)
[![Cargo](https://img.shields.io/crates/v/multisig-lite.svg)](
https://crates.io/crates/multisig-lite)
[![Documentation](https://docs.rs/multisig-lite/badge.svg)](
https://docs.rs/multisig-lite)

[`sol`]: https://www.tradingview.com/chart/?symbol=SOL
[multi signature wallet]: https://en.wikipedia.org/wiki/Cryptocurrency_wallet#Multisignature_wallet
[on-chain program]: programs/multisig-lite/README.md
[solana blockchain]: https://solana.com

A native [`SOL`] [multi signature wallet] dApp and [on-chain program]
for [Solana Blockchain].

## On-chain Program

- [multisig-lite](programs/multisig-lite/README.md)
  - [devnet](https://explorer.solana.com/address/Ecycmji8eeggXrA3rD2cdEHpHDnP4btvVfcyTBS9cG9t?cluster=devnet)

## Examples

### Rust

- [`multisig_lite::multisig_lite::create` instruction](programs/multisig-lite/examples/create.rs)
- [`multisig_lite::multisig_lite::fund` instruction](programs/multisig-lite/examples/fund.rs)
- [`multisig_lite::multisig_lite::close` instruction](programs/multisig-lite/examples/close.rs)
- [Multisig `State` account](programs/multisig-lite/examples/get-state.rs)
- [Multisig Fund account](programs/multisig-lite/examples/get-fund.rs)

## License

Licensed under either of

 * Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

#### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
