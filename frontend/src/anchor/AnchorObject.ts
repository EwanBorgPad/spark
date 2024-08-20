import {
  IdlTypeArray,
  IdlTypeCOption,
  IdlTypeDefined,
  IdlTypeGeneric, IdlTypeOption,
  IdlTypeVec,
} from "@coral-xyz/anchor/dist/cjs/idl"

const inlineIDL = {
  "address": "",
  "metadata": {
    "name": "borgpad",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const" as const,
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "program",
          "address": "bpadbLrS3Mw2e1EDSEnYzYpNwAQgJQXXHkT57D4TTJ4"
        },
        {
          "name": "program_data"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "admin_authority",
          "type": "pubkey" as IdlType,
        },
        {
          "name": "whitelist_authority",
          "type": "pubkey" as IdlType,
        }
      ]
    },
    {
      "name": "initialize_lbp",
      "discriminator": [
        119,
        247,
        64,
        213,
        235,
        101,
        68,
        207
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const" as const,
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "lbp",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const" as const,
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "arg" as const,
                "path": "uid"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "lbp_static_data",
          "type": {
            "defined": {
              "name": "LbpStaticData"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "Lbp",
      "discriminator": [
        149,
        191,
        222,
        43,
        244,
        62,
        21,
        241
      ]
    }
  ],
  "types": [
    {
      "name": "Config",
      "type": {
        "kind": "struct" as const,
        "fields": [
          {
            "name": "admin_authority",
            "docs": [
              "The authority that has admin right"
            ],
            "type": "pubkey" as IdlType,
          },
          {
            "name": "whitelist_authority",
            "docs": [
              "The authority that has whitelist right"
            ],
            "type": "pubkey" as IdlType,
          },
          {
            "name": "bump",
            "docs": [
              "The bump of the pda"
            ],
            "type": "u8" as IdlType,
          }
        ]
      }
    },
    {
      "name": "Lbp",
      "type": {
        "kind": "struct" as const,
        "fields": [
          {
            "name": "static_data",
            "type": {
              "defined": {
                "name": "LbpStaticData"
              }
            }
          },
          {
            "name": "dynamic_data",
            "type": {
              "defined": {
                "name": "LbpDynamicData"
              }
            }
          }
        ]
      }
    },
    {
      "name": "LbpDynamicData",
      "type": {
        "kind": "struct" as const,
        "fields": [
          {
            "name": "project_cap",
            "docs": [
              "The amount of token that remains after the end of the fund collection phase",
              "If the user_max_cap is reached, the project_cap equals the project_max_cap"
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "user_cap",
            "docs": [
              "The amount of token that the users have deposited",
              "This amount is greater than user_min_cap and smaller than user_max_cap"
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "lp_locked_phase_start_time",
            "docs": [
              "The start time of the LP locked phase",
              "Set by the program once the admin transition from fund collection to lp locked phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64" as IdlType,
          }
        ]
      }
    },
    {
      "name": "LbpStaticData",
      "type": {
        "kind": "struct" as const,
        "fields": [
          {
            "name": "uid",
            "docs": [
              "An id to uniquely identify the lbp"
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "project_owner",
            "docs": [
              "The owner of the lbp"
            ],
            "type": "pubkey" as IdlType,
          },
          {
            "name": "project_token_mint",
            "docs": [
              "The mint of the token supplied by the project"
            ],
            "type": "pubkey" as IdlType,
          },
          {
            "name": "project_token_lp_distribution",
            "docs": [
              "The part of token that is used for the liquidity pool. The rest is sent to the reward pool"
            ],
            "type": "u8" as IdlType,
          },
          {
            "name": "project_max_cap",
            "docs": [
              "The max amount of token that the project can deposit"
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "user_token_mint",
            "docs": [
              "The mint of the token supplied by the users"
            ],
            "type": "pubkey" as IdlType,
          },
          {
            "name": "user_min_cap",
            "docs": [
              "The min amount of token that the users must deposit to move to the LP locked phase",
              "If this amount is not reached the users are reimbursed"
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "user_max_cap",
            "docs": [
              "The max amount of token that the users can deposit"
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "fund_collection_phase_start_time",
            "docs": [
              "The start time of the fund collection phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "fund_collection_phase_end_time",
            "docs": [
              "The end time of the fund collection phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "lp_locked_phase_locking_time",
            "docs": [
              "The locking time of the LP locked phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "lp_locked_phase_vesting_time",
            "docs": [
              "The vesting time of the LP locked phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64" as IdlType,
          },
          {
            "name": "bump",
            "docs": [
              "The bump of the pda"
            ],
            "type": "u8" as IdlType,
          }
        ]
      }
    }
  ]
}

type IdlType = "bool" | "u8" | "i8" | "u16" | "i16" | "u32" | "i32" | "f32" | "u64" | "i64" | "f64" | "u128" | "i128" | "u256" | "i256" | "bytes" | "string" | "pubkey" | IdlTypeOption | IdlTypeCOption | IdlTypeVec | IdlTypeArray | IdlTypeDefined | IdlTypeGeneric;


import { Program } from "@coral-xyz/anchor";
import {
  clusterApiUrl,
  Connection,
  PublicKey
} from "@solana/web3.js"
// import idl from "./idl.json";

type IDL = typeof inlineIDL


export async function testAnchorObject() {
  console.log('testing anchor')

  const devnetExampleLbp = 'BpWYQLwzJDJYB9awK5JYDrH7v6HcwkYuBeWeSpL17KDh'
  const me = '5oY4RHVH4PBS3YDCuQ86gnaM27KvdC9232TpB71wLi1W'

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
  const publicKey = new PublicKey('5oY4RHVH4PBS3YDCuQ86gnaM27KvdC9232TpB71wLi1W')
  inlineIDL.address = 'BpWYQLwzJDJYB9awK5JYDrH7v6HcwkYuBeWeSpL17KDh'

  // const program = new Program(inlineIDL, {  }, {  });
  const program = new Program<IDL>(inlineIDL, { connection, wallet: publicKey })

  console.log('testing anchor2')
  const methods = program.methods
  const method = methods.initializeLbp
  const transaction = await methods.initializeLbp().transaction()
  console.log({ method, methods, transaction })

  console.log('testing anchor3')

}
