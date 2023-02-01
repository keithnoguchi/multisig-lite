# multisig-lite

[![License](https://img.shields.io/badge/license-Apache--2.0_OR_MIT-blue.svg)](
https://github.com/keithnoguchi/multisig-lite)
[![Cargo](https://img.shields.io/crates/v/multisig-lite.svg)](
https://crates.io/crates/multisig-lite)
[![Documentation](https://docs.rs/multisig-lite/badge.svg)](
https://docs.rs/multisig-lite)

[sol]: https://en.wikipedia.org/wiki/Solana_(blockchain_platform)
[multisig]: https://en.wikipedia.org/wiki/Cryptocurrency_wallet#Multisignature_wallet
[solana blockchain]: https://solana.com
[rust doc]: https://docs.rs/multisig-lite
[typescript test]: ../../../tests/multisig-lite.ts

A native [SOL] [multisig] on-chain program for [Solana Blockchain].

Currently, there are five instructions to provide the queued multisig transfer operation:

1. [`create`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.create.html)
2. [`fund`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.fund.html)
3. [`create_transfer`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.create_transfer.html)
4. [`approve`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.approve.html)
5. [`close`](https://docs.rs/multisig-lite/latest/multisig_lite/multisig_lite/fn.close.html)

Please refer to the [Rust doc] and [TypeScript test] for more detail.

## License

Licensed under either of

 * Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

#### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
