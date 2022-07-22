export const Networks = [
  {
      "name": "localhost",
      "chainId": 31337,
      "addresses": {
        "safientMain": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        "arbitrator": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      },
      "threadId": [1,85,190,125,255,149,94,224,247,165,55,194,53,75,163,230,224,80,198,146,32,225,130,30,173,42,163,106,72,245,42,17,94,15],
      "ceramic": {
        "CERAMIC_URL": "http://0.0.0.0:7007",
        "config": {
          "definitions": {
            "profile": "kjzl6cwe1jw1461yak5d2vxb571fwue4zazwtsr17r9ra47nldwxuioqmyyvm8d",
            "portfolio": "kjzl6cwe1jw149l1x2cp8yx1sm3cyp4ads9zcsy9bfuuo4jjbancd4w8uss827g",
            "encryptionKey": "kjzl6cwe1jw149ro0fooz3e9turjctjkhbmexqazpj8qmqaiqbcam2uu509okpg"
          },
          "schemas": {
            "profile": "ceramic://k3y52l7qbv1fryfct0m3s2yinpzx093x36e5uwi450nif178hwe1k9xyxut2kfn5s",
            "portfolio": "ceramic://k3y52l7qbv1frxrbbfvzjtif8i0bulkj5hmlphe2r2zuj8yowrw9xnqogyyxze9ds",
            "encryptionKey": "ceramic://k3y52l7qbv1fryn1e2v612wakbjfn3a516f0mx5bothu8bo2i63cekwivtx3c5p1c"
          }
        }
      }
  },

  {
      "name": "mainnet",
      "chainId": 1,
      "addresses": {
        "safientMain": "",
        "arbitrator": ""
      },
      "threadId": [1,85,224,59,133,212,56,89,195,42,112,158,252,143,96,35,63,28,175,36,55,183,38,29,131,0,183,156,60,25,19,79,123,50],
      "ceramic": {
        "CERAMIC_URL": "https://ceramic.safient.io",
        "config": {
          "definitions": {
            "profile": "kjzl6cwe1jw14bg00pp2o45fczfeeg1ewyh62wm5okfvuyw6dw6kdsbm4v7y7pk",
            "portfolio": "kjzl6cwe1jw14897mo6aqujqgib6txzap9z1uhs59rh0r0eb3z4pdzusxkq6rlq",
            "encryptionKey": "kjzl6cwe1jw147q78vcekjld9ynbpkedeaubspq1gp40da9xfkqswt1ioj7ausq"
          },
          "schemas": {
            "profile": "ceramic://k3y52l7qbv1frxzbyopzgl2wb915wv2auo9c28s13xp2gajjfrme4vaac526lxmgw",
            "portfolio": "ceramic://k3y52l7qbv1frxqp3vqgnohk3zsgrkt7bw4bqde3qcph9p5v2lm29min4dufaaby8",
            "encryptionKey": "ceramic://k3y52l7qbv1frxsi6ea7qmnshpvxh68lx35t9nkwqgnhgwn3i4n648u0x6eo2ga9s"
          }
        }        
      }
  },

  {
      "name":"devnet",
      "chainId": 31337,
      "addresses": {
        "safientMain": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        "arbitrator": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      },
      "threadId":  [1,85,80,127,181,68,182,72,102,205,134,52,114,140,252,60,202,121,104,1,254,161,68,70,206,54,41,135,185,183,109,155,83,210],
      "ceramic": {
        "CERAMIC_URL": "http://0.0.0.0:7007",
        "config": {
          "definitions": {
            "profile": "kjzl6cwe1jw1461yak5d2vxb571fwue4zazwtsr17r9ra47nldwxuioqmyyvm8d",
            "portfolio": "kjzl6cwe1jw149l1x2cp8yx1sm3cyp4ads9zcsy9bfuuo4jjbancd4w8uss827g",
            "encryptionKey": "kjzl6cwe1jw149ro0fooz3e9turjctjkhbmexqazpj8qmqaiqbcam2uu509okpg"
          },
          "schemas": {
            "profile": "ceramic://k3y52l7qbv1fryfct0m3s2yinpzx093x36e5uwi450nif178hwe1k9xyxut2kfn5s",
            "portfolio": "ceramic://k3y52l7qbv1frxrbbfvzjtif8i0bulkj5hmlphe2r2zuj8yowrw9xnqogyyxze9ds",
            "encryptionKey": "ceramic://k3y52l7qbv1fryn1e2v612wakbjfn3a516f0mx5bothu8bo2i63cekwivtx3c5p1c"
          }
        }
      }
  },
  {
      "name":"testnet",
      "chainId": 42,
      "addresses": {
        "safientMain": "0x8C2FA3dE952f5A1c463af0Fb42a9A812D3Ffe9e3",
        "arbitrator": "0x823E2b7623aD287819674548f43F8965F38B2626"
      },
      "threadId": [1,85,120,218,236,60,70,84,213,4,95,186,66,254,202,139,110,22,124,133,14,122,51,141,78,182,164,144,101,121,231,1,76,175],
      "ceramic": {
        "CERAMIC_URL": "https://ceramic-clay.safient.io",
        "config": {
          "definitions": {
            "profile": "kjzl6cwe1jw145yqkjh7w5u4imuls58cexsseh54ie2r2v02frarmqqc3mpzlnz",
            "portfolio": "kjzl6cwe1jw149g6cboxn6p6bpe412gi1kdwqkhpzevp6shb1sofupenia81n8q",
            "encryptionKey": "kjzl6cwe1jw149k7aya6p32taqdyqwykd7ti9r3hh06m68geb5ydclwtwsw75ep"
          },
          "schemas": {
            "profile": "ceramic://k3y52l7qbv1frybznimihiufqpznadtby4pu0ne6939jlbwfrfrm7il0oiwbw7y0w",
            "portfolio": "ceramic://k3y52l7qbv1frxx5lsz3kbrqjvo6nrnzjo2uvpptsqk632m4fbnh3asfaxfpv84xs",
            "encryptionKey": "ceramic://k3y52l7qbv1fryom56dnwzs6ybndyos9khw3ueqye2oggadt69who29at3gr7z01s"
          }
        }
        
      }
    }
]
