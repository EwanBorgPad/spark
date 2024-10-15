/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/borgpad.json`.
 */
export type Borgpad = {
  "address": "6Bz2wirsX2ZwJyq17GmyJ64UJiZhQDPfhHCMaKcemRXM",
  "metadata": {
    "name": "borgpad",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "acceptAdminAuthority",
      "discriminator": [
        109,
        115,
        12,
        245,
        11,
        10,
        16,
        209
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
          "name": "newAdminAuthority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
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
                "kind": "const",
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
          "address": "6Bz2wirsX2ZwJyq17GmyJ64UJiZhQDPfhHCMaKcemRXM"
        },
        {
          "name": "programData"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "adminAuthority",
          "type": "pubkey"
        },
        {
          "name": "whitelistAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeLbp",
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
          "name": "adminAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                "kind": "const",
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "lbp_initialize.uid"
              }
            ]
          }
        },
        {
          "name": "lbpRaisedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "raisedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lbpLaunchedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "launchedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "raisedTokenMint"
        },
        {
          "name": "launchedTokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "lbpInitialize",
          "type": {
            "defined": {
              "name": "lbpInitializeData"
            }
          }
        }
      ]
    },
    {
      "name": "moveToRefundPhase",
      "discriminator": [
        116,
        3,
        197,
        239,
        121,
        204,
        9,
        56
      ],
      "accounts": [
        {
          "name": "adminAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                "kind": "const",
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "lbp.uid",
                "account": "lbp"
              }
            ]
          }
        },
        {
          "name": "launchedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "launchedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "raisedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "raisedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "launchedTokenMint"
        },
        {
          "name": "raisedTokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "moveToVestingPhase",
      "discriminator": [
        159,
        229,
        131,
        232,
        254,
        89,
        150,
        232
      ],
      "accounts": [
        {
          "name": "adminAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
                "kind": "const",
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "lbp.uid",
                "account": "lbp"
              }
            ]
          }
        },
        {
          "name": "launchedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "launchedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "raisedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "raisedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "launchedTokenMint"
        },
        {
          "name": "raisedTokenMint"
        },
        {
          "name": "dexProgramId"
        },
        {
          "name": "ammConfig"
        },
        {
          "name": "authority"
        },
        {
          "name": "poolState",
          "writable": true
        },
        {
          "name": "lpMint",
          "writable": true
        },
        {
          "name": "creatorLpToken",
          "writable": true
        },
        {
          "name": "launchedTokenVault",
          "writable": true
        },
        {
          "name": "raisedTokenVault",
          "writable": true
        },
        {
          "name": "createPoolFee",
          "writable": true
        },
        {
          "name": "observationState",
          "writable": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "nominateNewAdminAuthority",
      "discriminator": [
        124,
        149,
        238,
        232,
        125,
        157,
        62,
        27
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
          "name": "adminAuthority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newAdminAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "projectDeposit",
      "discriminator": [
        77,
        170,
        151,
        48,
        160,
        150,
        231,
        170
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "lbp.uid",
                "account": "lbp"
              }
            ]
          }
        },
        {
          "name": "launchedTokenMint"
        },
        {
          "name": "projectLaunchedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "launchedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lbpLaunchedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "launchedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "projectRefund",
      "discriminator": [
        116,
        99,
        84,
        20,
        232,
        83,
        155,
        61
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "lbp.uid",
                "account": "lbp"
              }
            ]
          }
        },
        {
          "name": "projectLaunchedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "launchedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lbpLaunchedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "launchedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "launchedTokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setWhitelistAuthority",
      "discriminator": [
        88,
        124,
        102,
        66,
        136,
        116,
        23,
        209
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
          "name": "adminAuthority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newWhitelistAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "userDeposit",
      "discriminator": [
        186,
        198,
        140,
        233,
        129,
        39,
        98,
        153
      ],
      "accounts": [
        {
          "name": "whitelistAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "lbp.uid",
                "account": "lbp"
              }
            ]
          }
        },
        {
          "name": "positionMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "positionMint"
              }
            ]
          }
        },
        {
          "name": "userPositionAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "positionMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "raisedTokenMint"
        },
        {
          "name": "userRaisedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "raisedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lbpRaisedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "raisedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "userRefund",
      "discriminator": [
        133,
        154,
        72,
        184,
        41,
        87,
        239,
        85
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
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
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  98,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "lbp.uid",
                "account": "lbp"
              }
            ]
          }
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "positionMint"
              }
            ]
          }
        },
        {
          "name": "userPositionAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "positionMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userRaisedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "raisedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lbpRaisedTokenAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lbp"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "raisedTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "positionMint",
          "writable": true
        },
        {
          "name": "raisedTokenMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "config",
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
      "name": "lbp",
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
    },
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "doesNotHoldPosition",
      "msg": "The user must hold a position to perform this operation"
    },
    {
      "code": 6001,
      "name": "invalidAmount",
      "msg": "The amount does not match with the one in the position or the lbp"
    },
    {
      "code": 6002,
      "name": "invalidMint",
      "msg": "The mint does not correspond to the one in the lbp"
    },
    {
      "code": 6003,
      "name": "invalidPhaseChange",
      "msg": "This phase change is unauthorised"
    },
    {
      "code": 6004,
      "name": "invalidPosition",
      "msg": "This position is not linked to the provided lbp"
    },
    {
      "code": 6005,
      "name": "maxCapReached",
      "msg": "The max cap has been reached"
    },
    {
      "code": 6006,
      "name": "notAdminAuthority",
      "msg": "Signer must be the admin authority"
    },
    {
      "code": 6007,
      "name": "notProject",
      "msg": "Signer must be the project"
    },
    {
      "code": 6008,
      "name": "notWhitelistAuthority",
      "msg": "Signer must be the whitelist authority"
    },
    {
      "code": 6009,
      "name": "fundCollectionPhaseCompleted",
      "msg": "The fund collection phase is over"
    },
    {
      "code": 6010,
      "name": "fundCollectionPhaseNotStarted",
      "msg": "The fund collection phase has not yet started"
    },
    {
      "code": 6011,
      "name": "sameAdminAuthority",
      "msg": "Cannot set the same admin"
    },
    {
      "code": 6012,
      "name": "unauthorisedOperationInCurrentPhase",
      "msg": "This operation is not authorised in the current phase"
    },
    {
      "code": 6013,
      "name": "alreadyRefunded",
      "msg": "The project has already been refunded"
    }
  ],
  "types": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "adminAuthority",
            "docs": [
              "The authority that has admin right"
            ],
            "type": "pubkey"
          },
          {
            "name": "pendingAdminAuthority",
            "docs": [
              "The pending new authority that has admin right"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "whitelistAuthority",
            "docs": [
              "The authority that has whitelist right"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "The bump of the pda"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "lbp",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uid",
            "docs": [
              "An id to uniquely identify the lbp"
            ],
            "type": "u64"
          },
          {
            "name": "project",
            "docs": [
              "The owner of the lbp, i.e., the project launching the token"
            ],
            "type": "pubkey"
          },
          {
            "name": "launchedTokenMint",
            "docs": [
              "The mint of the token supplied by the project"
            ],
            "type": "pubkey"
          },
          {
            "name": "launchedTokenAta",
            "docs": [
              "The ata that holds the token deposited by the project"
            ],
            "type": "pubkey"
          },
          {
            "name": "launchedTokenLpDistribution",
            "docs": [
              "The part of token that is used for the liquidity pool. The rest is sent to the reward pool"
            ],
            "type": "u8"
          },
          {
            "name": "launchedTokenCap",
            "docs": [
              "The amount of token that the project must deposit"
            ],
            "type": "u64"
          },
          {
            "name": "raisedTokenMint",
            "docs": [
              "The mint of the token supplied by the users"
            ],
            "type": "pubkey"
          },
          {
            "name": "raisedTokenAta",
            "docs": [
              "The ata that holds the token deposited by the users"
            ],
            "type": "pubkey"
          },
          {
            "name": "raisedTokenMinCap",
            "docs": [
              "The min amount of token that the users must deposit to move to the LP locked phase",
              "If this amount is not reached the users are reimbursed"
            ],
            "type": "u64"
          },
          {
            "name": "raisedTokenMaxCap",
            "docs": [
              "The max amount of token that the users can deposit"
            ],
            "type": "u64"
          },
          {
            "name": "raisedTokenCap",
            "docs": [
              "The amount of token that the users have deposited",
              "This amount is greater than raised_token_min_cap and smaller than raised_token_max_cap"
            ],
            "type": "u64"
          },
          {
            "name": "phase",
            "docs": [
              "The current phase of the lbp"
            ],
            "type": {
              "defined": {
                "name": "phase"
              }
            }
          },
          {
            "name": "vestingStartTime",
            "docs": [
              "The start time of the cliff phase",
              "Set by the program once the admin transition from fund collection to cliff phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64"
          },
          {
            "name": "cliffDuration",
            "docs": [
              "The duration of the cliff phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64"
          },
          {
            "name": "vestingDuration",
            "docs": [
              "The duration of the vesting phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "The bump of the pda"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "lbpInitializeData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uid",
            "docs": [
              "An id to uniquely identify the lbp"
            ],
            "type": "u64"
          },
          {
            "name": "project",
            "docs": [
              "The owner of the lbp"
            ],
            "type": "pubkey"
          },
          {
            "name": "launchedTokenMint",
            "docs": [
              "The mint of the token supplied by the project"
            ],
            "type": "pubkey"
          },
          {
            "name": "launchedTokenLpDistribution",
            "docs": [
              "The part of token that is used for the liquidity pool. The rest is sent to the reward pool"
            ],
            "type": "u8"
          },
          {
            "name": "launchedTokenCap",
            "docs": [
              "The max amount of token that the project can deposit"
            ],
            "type": "u64"
          },
          {
            "name": "raisedTokenMint",
            "docs": [
              "The mint of the token supplied by the users"
            ],
            "type": "pubkey"
          },
          {
            "name": "raisedTokenMinCap",
            "docs": [
              "The min amount of token that the users must deposit to move to the LP locked phase",
              "If this amount is not reached the users are reimbursed"
            ],
            "type": "u64"
          },
          {
            "name": "raisedTokenMaxCap",
            "docs": [
              "The max amount of token that the users can deposit"
            ],
            "type": "u64"
          },
          {
            "name": "cliffDuration",
            "docs": [
              "The duration of the cliff phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64"
          },
          {
            "name": "vestingDuration",
            "docs": [
              "The duration of the vesting phase",
              "Expressed as Unix time (i.e. seconds since the Unix epoch)."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "phase",
      "docs": [
        "Valid phase change:",
        "FundCollection -> Refund",
        "FundCollection -> Vesting"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "fundCollection"
          },
          {
            "name": "refund"
          },
          {
            "name": "vesting"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "docs": [
              "The mint of the nft representing the position - used as uuid"
            ],
            "type": "pubkey"
          },
          {
            "name": "lbp",
            "docs": [
              "The lpb this position is linked to"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount deposited by the user"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "The bump of the pda"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
