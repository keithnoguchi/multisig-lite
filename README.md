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

[`sol`]: https://www.tradingview.com/chart/?symbol=SOL
[multi signature wallet]: https://en.wikipedia.org/wiki/Cryptocurrency_wallet#Multisignature_wallet
[dapp]: app/README.md
[on-chain program]: programs/multisig-lite/README.md
[solana blockchain]: https://solana.com

A native [`SOL`] [multi signature wallet] [dApp] and [on-chain program]
for [Solana Blockchain].

## Test

### On-chain program

[solana local development]: https://docs.solana.com/getstarted/local

Run those anchor commands on the [Solana local development] environment:

```
$ yarn
$ anchor build -- --features localnet
$ anchor run cp-local-program-keypair
$ anchor run local-validator
$ anchor test --skip-build --skip-local-validator
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
