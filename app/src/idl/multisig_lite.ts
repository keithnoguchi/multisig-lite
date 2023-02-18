export type MultisigLite = {
  "version": "0.0.8",
  "name": "multisig_lite",
  "docs": [
    "Module representing the program instruction handlers.",
    "",
    "# Examples",
    "",
    "Here is how to approve pending transfers on Devnet.",
    "",
    "Please take a look at the individual functions for other",
    "instruction opperations. e.g. [`multisig_lite::fund`] for",
    "how to fund the multisig account.",
    "",
    "```no_run",
    "use std::rc::Rc;",
    "",
    "use solana_sdk::commitment_config::CommitmentConfig;",
    "use solana_sdk::instruction::AccountMeta;",
    "use solana_sdk::pubkey::Pubkey;",
    "use solana_sdk::signature::read_keypair_file;",
    "use solana_sdk::signer::Signer;",
    "",
    "use anchor_client::{Client, Cluster};",
    "",
    "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
    "let url = Cluster::Devnet;",
    "let signer = Rc::new(read_keypair_file(",
    "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
    ")?);",
    "let opts = CommitmentConfig::processed();",
    "let pid = multisig_lite::id();",
    "let program = Client::new_with_options(url, signer.clone(), opts).program(pid);",
    "",
    "// Gets the PDAs.",
    "let (state_pda, state_bump) =",
    "Pubkey::find_program_address(&[b\"state\", signer.pubkey().as_ref()], &pid);",
    "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
    "",
    "// Gets the pending transfers and the recipients account info.",
    "let mut remaining_accounts = vec![];",
    "let state: multisig_lite::State = program.account(state_pda)?;",
    "for transfer_pubkey in state.queue {",
    "let transfer: multisig_lite::Transfer = program.account(transfer_pubkey)?;",
    "",
    "// Pushes the transfer account.",
    "remaining_accounts.push(AccountMeta {",
    "pubkey: transfer_pubkey,",
    "is_signer: false,",
    "is_writable: true,",
    "});",
    "",
    "// Pushes the recipient account.",
    "remaining_accounts.push(AccountMeta {",
    "pubkey: transfer.recipient,",
    "is_signer: false,",
    "is_writable: true,",
    "});",
    "}",
    "",
    "// Approve the multisig account.",
    "let sig = program",
    ".request()",
    ".accounts(multisig_lite::accounts::Approve {",
    "signer: signer.pubkey(),",
    "state: state_pda,",
    "fund: fund_pda,",
    "})",
    ".args(multisig_lite::instruction::Approve { fund_bump })",
    ".accounts(remaining_accounts)",
    ".signer(signer.as_ref())",
    ".send()?;",
    "",
    "println!(\"{sig}\");",
    "# Ok(())",
    "# }",
    "```"
  ],
  "instructions": [
    {
      "name": "create",
      "docs": [
        "Creates a multisig account.",
        "",
        "It's restricted one multisig account to each funder Pubkey,",
        "as it's used for the multisig PDA address generation.",
        "",
        "# Examples",
        "",
        "Here is how you create a multisig account on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "use solana_sdk::system_program;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Creates a multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Create {",
        "funder: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "system_program: system_program::id(),",
        "})",
        ".args(multisig_lite::instruction::Create {",
        "m: 2, // m as in m/n.",
        "signers: vec![funder.pubkey(), Pubkey::new_unique(), Pubkey::new_unique()],",
        "q: 10, // transfer queue limit.",
        "_state_bump: state_bump,",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "A funder of the multisig account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program to create a multisig PDA accounts."
          ]
        }
      ],
      "args": [
        {
          "name": "m",
          "type": "u8"
        },
        {
          "name": "signers",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "q",
          "type": "u8"
        },
        {
          "name": "stateBump",
          "type": "u8"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "fund",
      "docs": [
        "Funds lamports to the multisig fund account.",
        "",
        "The funding is only allowed by the multisig account funder.",
        "",
        "# Examples",
        "",
        "Here is how to fund to the multisig account on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::native_token::LAMPORTS_PER_SOL;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "use solana_sdk::system_program;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Funds the multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Fund {",
        "funder: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "system_program: system_program::id(),",
        "})",
        ".args(multisig_lite::instruction::Fund {",
        "lamports: 1_000_000 * LAMPORTS_PER_SOL, // 1M SOL!? :)",
        "_state_bump: state_bump,",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "A funder of the account.",
            "",
            "The funding is only allowed by the multisig account creator."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program to make the transfer of the fund."
          ]
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "stateBump",
          "type": "u8"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createTransfer",
      "docs": [
        "Creates a queued transfer lamports to the recipient.",
        "",
        "Transfer account creation fee will be given back to the",
        "creator of the transfer from the multisig fund.",
        "",
        "# Examples",
        "",
        "Here is how to create a pending transfer on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::native_token::LAMPORTS_PER_SOL;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::{keypair::Keypair, Signer};",
        "use solana_sdk::system_program;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Temporary transfer keypair.",
        "//",
        "// This is only required for the transaction signature and",
        "// won't be required once the transaction is recorded on the",
        "// ledger.",
        "let transfer = Keypair::new();",
        "",
        "// Creates a pending transfer.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::CreateTransfer {",
        "creator: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "transfer: transfer.pubkey(),",
        "system_program: system_program::id(),",
        "})",
        ".args(multisig_lite::instruction::CreateTransfer {",
        "recipient: Pubkey::new_unique(),",
        "lamports: 1_000_000 * LAMPORTS_PER_SOL, // 1M SOL!? :)",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".signer(&transfer)",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "An initiator of the fund transfer.",
            "",
            "It should be one of the signers of the multisig account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund PDA account.",
            ""
          ]
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "A transfer account to keep the queued transfer info."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program to create a transfer account."
          ]
        }
      ],
      "args": [
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "approve",
      "docs": [
        "Approves the transactions and executes the transfer",
        "in case the `m` approvals are met.",
        "",
        "# Examples",
        "",
        "Here is how to approve pending transfers on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::instruction::AccountMeta;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let signer = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, signer.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", signer.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Gets the pending transfers and the recipients account info.",
        "let mut remaining_accounts = vec![];",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "for transfer_pubkey in state.queue {",
        "let transfer: multisig_lite::Transfer = program.account(transfer_pubkey)?;",
        "",
        "// Pushes the transfer account.",
        "remaining_accounts.push(AccountMeta {",
        "pubkey: transfer_pubkey,",
        "is_signer: false,",
        "is_writable: true,",
        "});",
        "",
        "// Pushes the recipient account.",
        "remaining_accounts.push(AccountMeta {",
        "pubkey: transfer.recipient,",
        "is_signer: false,",
        "is_writable: true,",
        "});",
        "}",
        "",
        "// Approve the multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Approve {",
        "signer: signer.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "})",
        ".args(multisig_lite::instruction::Approve { fund_bump })",
        ".accounts(remaining_accounts)",
        ".signer(signer.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "An approver of the current state of the multisg account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund account.",
            ""
          ]
        }
      ],
      "args": [
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "close",
      "docs": [
        "Closes the multisig account.",
        "",
        "It cleans up all the remaining accounts and return those rents",
        "back to the funder, original creator of the multisig account.",
        "",
        "# Examples",
        "",
        "Here is how you close the multisig account on devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::instruction::AccountMeta;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Gets the remaining transfers to collects the rents.",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "let remaining_accounts: Vec<_> = state",
        ".queue",
        ".into_iter()",
        ".map(|pubkey| AccountMeta {",
        "pubkey,",
        "is_signer: false,",
        "is_writable: true,",
        "})",
        ".collect();",
        "",
        "// close the multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Close {",
        "funder: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "})",
        ".args(multisig_lite::instruction::Close {",
        "_state_bump: state_bump,",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "An original funder of the multisig account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund PDA account.",
            ""
          ]
        }
      ],
      "args": [
        {
          "name": "stateBump",
          "type": "u8"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "state",
      "docs": [
        "A multisig [`State`] PDA account data.",
        "",
        "# Examples",
        "",
        "Here is how to query the [`State`] PDA account on Devnet.",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, _state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "",
        "// Query the `multisig_lite::State` account.",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "",
        "// Print out the state account.",
        "println!(\"{state:?}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "m",
            "docs": [
              "A threshold."
            ],
            "type": "u8"
          },
          {
            "name": "signers",
            "docs": [
              "An array of signers Pubkey."
            ],
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "signed",
            "docs": [
              "A current signed state."
            ],
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "fund",
            "docs": [
              "A fund PDA account, holding the native SOL."
            ],
            "type": "publicKey"
          },
          {
            "name": "balance",
            "docs": [
              "A balance of the fund in lamports."
            ],
            "type": "u64"
          },
          {
            "name": "q",
            "docs": [
              "A limit of the pending transactions."
            ],
            "type": "u8"
          },
          {
            "name": "queue",
            "docs": [
              "An array of the pending transactions."
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "transfer",
      "docs": [
        "A multisig [`Transfer`] account data.",
        "",
        "# Examples",
        "",
        "Here is how to query the [`Transfer`] PDA account on Devnet.",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, _state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "",
        "// Query the `multisig_lite::State` account to get the queued transfers.",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "",
        "// Query the `multisig_lite::Transfer` accounts iteratively.",
        "for transfer in state.queue {",
        "let transfer: multisig_lite::Transfer = program.account(transfer)?;",
        "println!(\"{transfer:?}\");",
        "}",
        "# Ok(())",
        "# }",
        "```"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "docs": [
              "An creator of the transfer, one of the multisig",
              "signers."
            ],
            "type": "publicKey"
          },
          {
            "name": "recipient",
            "docs": [
              "A recipient of the transfer."
            ],
            "type": "publicKey"
          },
          {
            "name": "lamports",
            "docs": [
              "A lamports to transfer."
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AccountEmpty",
      "msg": "Multisig account is empty. Please create transactions"
    },
    {
      "code": 6001,
      "name": "AccountFull",
      "msg": "Multisig transaction queue is full. Please approve those."
    },
    {
      "code": 6002,
      "name": "AccountLocked",
      "msg": "Multisig account is locked. Please approve the transactions"
    },
    {
      "code": 6003,
      "name": "MissingRecipientAccountInfo",
      "msg": "Missing transfer recipient AccountInfo"
    },
    {
      "code": 6004,
      "name": "FundAccountNotWritable",
      "msg": "Fund account is not writable"
    },
    {
      "code": 6005,
      "name": "FundAccountIsNotEmpty",
      "msg": "Fund account data is not empty"
    },
    {
      "code": 6006,
      "name": "InvalidFundAddress",
      "msg": "Invalid fund account"
    },
    {
      "code": 6007,
      "name": "InvalidFundBumpSeed",
      "msg": "Invalid fund bump seed"
    },
    {
      "code": 6008,
      "name": "NoSigners",
      "msg": "No signers provided"
    },
    {
      "code": 6009,
      "name": "TooManySigners",
      "msg": "Too many signers provided"
    },
    {
      "code": 6010,
      "name": "ThresholdTooHigh",
      "msg": "Threshold too high"
    },
    {
      "code": 6011,
      "name": "InvalidSigner",
      "msg": "Invalid signer"
    },
    {
      "code": 6012,
      "name": "NotEnoughFundBalance",
      "msg": "There is not enough fund balance"
    }
  ]
};

export const IDL: MultisigLite = {
  "version": "0.0.8",
  "name": "multisig_lite",
  "docs": [
    "Module representing the program instruction handlers.",
    "",
    "# Examples",
    "",
    "Here is how to approve pending transfers on Devnet.",
    "",
    "Please take a look at the individual functions for other",
    "instruction opperations. e.g. [`multisig_lite::fund`] for",
    "how to fund the multisig account.",
    "",
    "```no_run",
    "use std::rc::Rc;",
    "",
    "use solana_sdk::commitment_config::CommitmentConfig;",
    "use solana_sdk::instruction::AccountMeta;",
    "use solana_sdk::pubkey::Pubkey;",
    "use solana_sdk::signature::read_keypair_file;",
    "use solana_sdk::signer::Signer;",
    "",
    "use anchor_client::{Client, Cluster};",
    "",
    "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
    "let url = Cluster::Devnet;",
    "let signer = Rc::new(read_keypair_file(",
    "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
    ")?);",
    "let opts = CommitmentConfig::processed();",
    "let pid = multisig_lite::id();",
    "let program = Client::new_with_options(url, signer.clone(), opts).program(pid);",
    "",
    "// Gets the PDAs.",
    "let (state_pda, state_bump) =",
    "Pubkey::find_program_address(&[b\"state\", signer.pubkey().as_ref()], &pid);",
    "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
    "",
    "// Gets the pending transfers and the recipients account info.",
    "let mut remaining_accounts = vec![];",
    "let state: multisig_lite::State = program.account(state_pda)?;",
    "for transfer_pubkey in state.queue {",
    "let transfer: multisig_lite::Transfer = program.account(transfer_pubkey)?;",
    "",
    "// Pushes the transfer account.",
    "remaining_accounts.push(AccountMeta {",
    "pubkey: transfer_pubkey,",
    "is_signer: false,",
    "is_writable: true,",
    "});",
    "",
    "// Pushes the recipient account.",
    "remaining_accounts.push(AccountMeta {",
    "pubkey: transfer.recipient,",
    "is_signer: false,",
    "is_writable: true,",
    "});",
    "}",
    "",
    "// Approve the multisig account.",
    "let sig = program",
    ".request()",
    ".accounts(multisig_lite::accounts::Approve {",
    "signer: signer.pubkey(),",
    "state: state_pda,",
    "fund: fund_pda,",
    "})",
    ".args(multisig_lite::instruction::Approve { fund_bump })",
    ".accounts(remaining_accounts)",
    ".signer(signer.as_ref())",
    ".send()?;",
    "",
    "println!(\"{sig}\");",
    "# Ok(())",
    "# }",
    "```"
  ],
  "instructions": [
    {
      "name": "create",
      "docs": [
        "Creates a multisig account.",
        "",
        "It's restricted one multisig account to each funder Pubkey,",
        "as it's used for the multisig PDA address generation.",
        "",
        "# Examples",
        "",
        "Here is how you create a multisig account on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "use solana_sdk::system_program;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Creates a multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Create {",
        "funder: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "system_program: system_program::id(),",
        "})",
        ".args(multisig_lite::instruction::Create {",
        "m: 2, // m as in m/n.",
        "signers: vec![funder.pubkey(), Pubkey::new_unique(), Pubkey::new_unique()],",
        "q: 10, // transfer queue limit.",
        "_state_bump: state_bump,",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "A funder of the multisig account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program to create a multisig PDA accounts."
          ]
        }
      ],
      "args": [
        {
          "name": "m",
          "type": "u8"
        },
        {
          "name": "signers",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "q",
          "type": "u8"
        },
        {
          "name": "stateBump",
          "type": "u8"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "fund",
      "docs": [
        "Funds lamports to the multisig fund account.",
        "",
        "The funding is only allowed by the multisig account funder.",
        "",
        "# Examples",
        "",
        "Here is how to fund to the multisig account on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::native_token::LAMPORTS_PER_SOL;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "use solana_sdk::system_program;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Funds the multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Fund {",
        "funder: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "system_program: system_program::id(),",
        "})",
        ".args(multisig_lite::instruction::Fund {",
        "lamports: 1_000_000 * LAMPORTS_PER_SOL, // 1M SOL!? :)",
        "_state_bump: state_bump,",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "A funder of the account.",
            "",
            "The funding is only allowed by the multisig account creator."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund account.",
            ""
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program to make the transfer of the fund."
          ]
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "stateBump",
          "type": "u8"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createTransfer",
      "docs": [
        "Creates a queued transfer lamports to the recipient.",
        "",
        "Transfer account creation fee will be given back to the",
        "creator of the transfer from the multisig fund.",
        "",
        "# Examples",
        "",
        "Here is how to create a pending transfer on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::native_token::LAMPORTS_PER_SOL;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::{keypair::Keypair, Signer};",
        "use solana_sdk::system_program;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Temporary transfer keypair.",
        "//",
        "// This is only required for the transaction signature and",
        "// won't be required once the transaction is recorded on the",
        "// ledger.",
        "let transfer = Keypair::new();",
        "",
        "// Creates a pending transfer.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::CreateTransfer {",
        "creator: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "transfer: transfer.pubkey(),",
        "system_program: system_program::id(),",
        "})",
        ".args(multisig_lite::instruction::CreateTransfer {",
        "recipient: Pubkey::new_unique(),",
        "lamports: 1_000_000 * LAMPORTS_PER_SOL, // 1M SOL!? :)",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".signer(&transfer)",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "An initiator of the fund transfer.",
            "",
            "It should be one of the signers of the multisig account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund PDA account.",
            ""
          ]
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "A transfer account to keep the queued transfer info."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The system program to create a transfer account."
          ]
        }
      ],
      "args": [
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "lamports",
          "type": "u64"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "approve",
      "docs": [
        "Approves the transactions and executes the transfer",
        "in case the `m` approvals are met.",
        "",
        "# Examples",
        "",
        "Here is how to approve pending transfers on Devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::instruction::AccountMeta;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let signer = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, signer.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", signer.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Gets the pending transfers and the recipients account info.",
        "let mut remaining_accounts = vec![];",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "for transfer_pubkey in state.queue {",
        "let transfer: multisig_lite::Transfer = program.account(transfer_pubkey)?;",
        "",
        "// Pushes the transfer account.",
        "remaining_accounts.push(AccountMeta {",
        "pubkey: transfer_pubkey,",
        "is_signer: false,",
        "is_writable: true,",
        "});",
        "",
        "// Pushes the recipient account.",
        "remaining_accounts.push(AccountMeta {",
        "pubkey: transfer.recipient,",
        "is_signer: false,",
        "is_writable: true,",
        "});",
        "}",
        "",
        "// Approve the multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Approve {",
        "signer: signer.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "})",
        ".args(multisig_lite::instruction::Approve { fund_bump })",
        ".accounts(remaining_accounts)",
        ".signer(signer.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "An approver of the current state of the multisg account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund account.",
            ""
          ]
        }
      ],
      "args": [
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "close",
      "docs": [
        "Closes the multisig account.",
        "",
        "It cleans up all the remaining accounts and return those rents",
        "back to the funder, original creator of the multisig account.",
        "",
        "# Examples",
        "",
        "Here is how you close the multisig account on devnet:",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::instruction::AccountMeta;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "let (fund_pda, fund_bump) = Pubkey::find_program_address(&[b\"fund\", state_pda.as_ref()], &pid);",
        "",
        "// Gets the remaining transfers to collects the rents.",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "let remaining_accounts: Vec<_> = state",
        ".queue",
        ".into_iter()",
        ".map(|pubkey| AccountMeta {",
        "pubkey,",
        "is_signer: false,",
        "is_writable: true,",
        "})",
        ".collect();",
        "",
        "// close the multisig account.",
        "let sig = program",
        ".request()",
        ".accounts(multisig_lite::accounts::Close {",
        "funder: funder.pubkey(),",
        "state: state_pda,",
        "fund: fund_pda,",
        "})",
        ".args(multisig_lite::instruction::Close {",
        "_state_bump: state_bump,",
        "fund_bump,",
        "})",
        ".signer(funder.as_ref())",
        ".send()?;",
        "",
        "println!(\"{sig}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "accounts": [
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "An original funder of the multisig account."
          ]
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig state PDA account."
          ]
        },
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A multisig fund PDA account.",
            ""
          ]
        }
      ],
      "args": [
        {
          "name": "stateBump",
          "type": "u8"
        },
        {
          "name": "fundBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "state",
      "docs": [
        "A multisig [`State`] PDA account data.",
        "",
        "# Examples",
        "",
        "Here is how to query the [`State`] PDA account on Devnet.",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, _state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "",
        "// Query the `multisig_lite::State` account.",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "",
        "// Print out the state account.",
        "println!(\"{state:?}\");",
        "# Ok(())",
        "# }",
        "```"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "m",
            "docs": [
              "A threshold."
            ],
            "type": "u8"
          },
          {
            "name": "signers",
            "docs": [
              "An array of signers Pubkey."
            ],
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "signed",
            "docs": [
              "A current signed state."
            ],
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "fund",
            "docs": [
              "A fund PDA account, holding the native SOL."
            ],
            "type": "publicKey"
          },
          {
            "name": "balance",
            "docs": [
              "A balance of the fund in lamports."
            ],
            "type": "u64"
          },
          {
            "name": "q",
            "docs": [
              "A limit of the pending transactions."
            ],
            "type": "u8"
          },
          {
            "name": "queue",
            "docs": [
              "An array of the pending transactions."
            ],
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "transfer",
      "docs": [
        "A multisig [`Transfer`] account data.",
        "",
        "# Examples",
        "",
        "Here is how to query the [`Transfer`] PDA account on Devnet.",
        "",
        "```no_run",
        "use std::rc::Rc;",
        "",
        "use solana_sdk::commitment_config::CommitmentConfig;",
        "use solana_sdk::pubkey::Pubkey;",
        "use solana_sdk::signature::read_keypair_file;",
        "use solana_sdk::signer::Signer;",
        "",
        "use anchor_client::{Client, Cluster};",
        "",
        "# fn main() -> Result<(), Box<dyn std::error::Error>> {",
        "let url = Cluster::Devnet;",
        "let funder = Rc::new(read_keypair_file(",
        "shellexpand::tilde(\"~/.config/solana/id.json\").as_ref(),",
        ")?);",
        "let opts = CommitmentConfig::processed();",
        "let pid = multisig_lite::id();",
        "let program = Client::new_with_options(url, funder.clone(), opts).program(pid);",
        "",
        "// Gets the PDAs.",
        "let (state_pda, _state_bump) =",
        "Pubkey::find_program_address(&[b\"state\", funder.pubkey().as_ref()], &pid);",
        "",
        "// Query the `multisig_lite::State` account to get the queued transfers.",
        "let state: multisig_lite::State = program.account(state_pda)?;",
        "",
        "// Query the `multisig_lite::Transfer` accounts iteratively.",
        "for transfer in state.queue {",
        "let transfer: multisig_lite::Transfer = program.account(transfer)?;",
        "println!(\"{transfer:?}\");",
        "}",
        "# Ok(())",
        "# }",
        "```"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "docs": [
              "An creator of the transfer, one of the multisig",
              "signers."
            ],
            "type": "publicKey"
          },
          {
            "name": "recipient",
            "docs": [
              "A recipient of the transfer."
            ],
            "type": "publicKey"
          },
          {
            "name": "lamports",
            "docs": [
              "A lamports to transfer."
            ],
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AccountEmpty",
      "msg": "Multisig account is empty. Please create transactions"
    },
    {
      "code": 6001,
      "name": "AccountFull",
      "msg": "Multisig transaction queue is full. Please approve those."
    },
    {
      "code": 6002,
      "name": "AccountLocked",
      "msg": "Multisig account is locked. Please approve the transactions"
    },
    {
      "code": 6003,
      "name": "MissingRecipientAccountInfo",
      "msg": "Missing transfer recipient AccountInfo"
    },
    {
      "code": 6004,
      "name": "FundAccountNotWritable",
      "msg": "Fund account is not writable"
    },
    {
      "code": 6005,
      "name": "FundAccountIsNotEmpty",
      "msg": "Fund account data is not empty"
    },
    {
      "code": 6006,
      "name": "InvalidFundAddress",
      "msg": "Invalid fund account"
    },
    {
      "code": 6007,
      "name": "InvalidFundBumpSeed",
      "msg": "Invalid fund bump seed"
    },
    {
      "code": 6008,
      "name": "NoSigners",
      "msg": "No signers provided"
    },
    {
      "code": 6009,
      "name": "TooManySigners",
      "msg": "Too many signers provided"
    },
    {
      "code": 6010,
      "name": "ThresholdTooHigh",
      "msg": "Threshold too high"
    },
    {
      "code": 6011,
      "name": "InvalidSigner",
      "msg": "Invalid signer"
    },
    {
      "code": 6012,
      "name": "NotEnoughFundBalance",
      "msg": "There is not enough fund balance"
    }
  ]
};
