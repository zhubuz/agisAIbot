/*jslint node:true*/
let Enums = {
        AccountStatus: {
            Active: 0,
            Disbled: 0
        },
        TransactionStatus: {
            Pending: 0,
            Complete: 0,
            Failed: 0
        },
        TransactionType: {
            CreateUser: {
                Point: 100
            },
            CryptoBuzzer: {
                Point: -10,
                Reward: 5
            },
            MaskFace: {
                Point: -30,
                Reward: 10
            },
            MemeMint: {
                Point: -30,
                Reward: 10
            },
            PixelMorphAI: {
                Point: -40,
                Reward: 15
            },
            LiveFaceBaseImage: {
                Point: -30,
                Reward: 10
            },
            CheckIn: {
                Point: 300,
                MethodName: "CheckIn",
                ServiceName: "User"
            }
        },
        PointType: {
            General: 0,
            Reward: 0
        },
        ErrorMessage: {
            NotEnoughPoint: "Not Enough Point"
        }
    };
require('./EnumsBase.js').SetNames(Enums);
require('./EnumsBase.js').SetNames(Enums.TransactionType, "Name");

module.exports = Enums;