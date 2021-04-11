const User = require('../Models/User')
const Match = require('../Models/Match')
const Report = require('../Models/Report')
const Zone = require('../Models/Zone')
const bcrypt = require('bcryptjs');
const token = require('../Utils/token')
const findZone = require('../Utils/findZone')



exports.getIndex = async (req, res) => {
    findZone.findZone({latitude:48.198552,longitude:3.282151},r => {
        return res.status(200).json(r)
    })
}

exports.postRegister = (req, res) => {
    const pseudo = req.body.pseudo
    const tel = req.body.tel
    const password = req.body.password;

    console.log(req.body)

    User.findOne({
            $or: [{
                pseudo: /pseudo/i
            }, {
                tel: tel
            }]
        })
        .then(userDoc => {
            if (userDoc) {
                if (userDoc.pseudo.toLowerCase() == pseudo.toLowerCase()) {
                    return res.status(500).json({
                        message: "Ce Pseudo est déjà utilisé"
                    })
                } else {
                    return res.status(500).json({
                        message: "Ce numéro de téléphone est déjà utilisé"
                    })
                }
            } else {
                return bcrypt
                    .hash(password, 12)
                    .then(hashedPassword => {
                        const user = new User({
                            pseudo: pseudo,
                            tel: tel,
                            password: hashedPassword,
                        });
                        user.save()
                        return res.status(200).json({
                            success: true,
                        })
                    })
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                message: 'Une erreur s\'est produite veuillez réessayer plus tard'
            })
        });
}

exports.postLogin = (req, res) => {
    const identifiant = req.body.identifiant;
    const password = req.body.password;
    User.findOne({
            $or: [{
                pseudo: identifiant
            }, {
                tel: identifiant
            }]
        })
        .then(user => {
            if (!user) {
                return res.status(500).json({
                    message: "Identifiant ou mot de passe incorrecte"
                })
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token_ = token.token()
                        user.login_token = token_
                        user.save().then(r => {
                            return res.status(200).json({
                                message: "utilisateur connecté avec succès",
                                data: user
                            })
                        })
                    } else {
                        return res.status(500).json({
                            message: "Identifiant ou mot de passe incorrecte"
                        })
                    }
                })
                .catch(err => {
                    console.log(err)
                    return res.status(500).json({
                        message: "Identifiant ou mot de passe incorrecte"
                    })
                });
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                ...{
                    status: 500
                },
                ...err
            })
        });
}

exports.getUser = (req, res) => {
    User.findById(req.params.id).then(user => {
        if (!user) {
            return res.status(500).json({
                error: "pas d'utilisateur"
            })
        }
        return res.status(200).json({
            user: {
                _id: user._id,
                elos: user.elos,
                pseudo: user.pseudo
            }
        })
    }).catch(err => {
        return res.status(500).json({
            error: err
        })
    })
}

exports.getMatch = (req, res) => {
    const lobby = req.params.lobby;
    Match.findOne({
        lobby: lobby
    }).populate('team1', 'pseudo elos').populate('team2', 'pseudo elos').then(match => {
        return res.status(200).json(match)
    }).catch(err => {
        return res.status(500).json({
            error: err
        })
    })
}

exports.getMatchById = (req, res) => {
    const id = req.params.id;
    Match.findById(id).populate('team1', 'pseudo elos').populate('team2', 'pseudo elos').then(match => {
        return res.status(200).json(match)
    }).catch(err => {
        return res.status(500).json({
            error: err
        })
    })
}

exports.getResult = (req, res) => {
    const userId = req.params.userId
    const matchId = req.params.lobby
    Match.findOne({
        lobby: matchId
    }).then(match => {
        return res.status(200).json(match)
    })
}

exports.postReport = (req, res) => {
    const message = req.body.message;
    const userId = req.body.userId
    const matchId = req.body.matchId
    const report = new Report({
        user: userId,
        match: matchId,
        message: message,
        date: new Date()
    })
    report.save().then(r => {
        return res.status(200).json({
            success: true
        })
    })
}

exports.postCreateZone = (req, res) => {
    console.log('creating a new zone')
    const nom = "Yonne Nord Dev"
    const border = [{"latitude":48.31208197039403,"longitude":3.2155864821248636},{"latitude":48.28467445454998,"longitude":3.1139629469686136},{"latitude":48.26822288204785,"longitude":3.0919902907186136},{"latitude":48.20602468426505,"longitude":3.0425518141561136},{"latitude":48.148332395410456,"longitude":3.0315654860311136},{"latitude":48.121753806105446,"longitude":3.0549114332967386},{"latitude":48.07222597551605,"longitude":3.1647747145467386},{"latitude":48.04744416753152,"longitude":3.2966106520467386},{"latitude":48.05845977717981,"longitude":3.3625286207967386},{"latitude":48.09057517951562,"longitude":3.4408062086873636},{"latitude":48.13000380617441,"longitude":3.4531658278279886},{"latitude":48.19504068190343,"longitude":3.4765117750936136},{"latitude":48.241706427543676,"longitude":3.4586589918904886},{"latitude":48.2801051046818,"longitude":3.4257000075154886},{"latitude":48.310255260432,"longitude":3.3693950758748636},{"latitude":48.322127706319144,"longitude":3.313090144234238}]


    const zone = new Zone({
        nom:nom,
        border:border
    })
    zone.save()
    return res.status(200).json({
        success:true
    })
}

exports.getZones = (req,res) => {
    Zone.find().then(zones => {
        return res.status(200).json(zones)
    }).catch(err =>{
        return res.status(500).json({
            message:"Une erreur s'est produit"
        })
    })
}

exports.getElo = (req,res) => {
    const userId = req.params.userId;
    const zoneId = req.params.zoneId
    User.findById(userId).then(user =>{
        const elos = user.elos.slice()
        const eloInZone = elos.find(e => e.zone == zoneId)
        if(!eloInZone){
            return res.status(200).json({
                elo:1000
            })
        }

        return res.status(200).json({
            elo : eloInZone.elo
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            message:"db error"
        })
    })
}

exports.getClassement = (req,res) => {
    const zoneId = req.params.zoneId
    User.find().then(users => {
        const classement = []
        for(var user of users){
            const userElo = user.elos
            const userEloInZone = userElo.find(e => e.zone == zoneId)
            if(userEloInZone){
                classement.push(
                    {
                        id:user._id,
                        pseudo:user.pseudo,
                        elo:userEloInZone.elo
                    }
                )
            }
        }
        classement.sort((a,b) => (a.elo > b.elo) ? -1 : 1)
        return res.status(200).json(classement)
    })
}

exports.getCoins = (req,res) => {
    const userId = req.params.userId
    User.findById(userId).then(user => {
        return res.status(200).json({
            coins : user.coins
        })
    })
}

exports.getGameMarkers = (req,res) => {
    const matchs24H = []
    const now = new Date()
    const H24 = 24*60*60*1000
    Match.find({"date_debut" :{$gt:new Date(Date.now() - 24*60*60 * 1000)}}).then(matchs => {
        for(let match of matchs){
            if(Math.abs(now - match.date_debut) < H24){ //Si le match date de moins de 24h
                matchs24H.push(match)
            }
        }
        return res.status(200).json({
            matchs24H : matchs24H
        })
    }).catch(err =>{
        console.log(err)
        return res.status(500).json({
            message:"DB error"
        })
    })
}

exports.getIsInGame = (req,res) => {
    const userId = req.params.id
    Match.findOne({
        $and : [
            { 
              $or : [ 
                      {"team1" : userId},
                      {"team2" : userId}
                    ]
            },
            { 
              "isGameOver":false
            }
          ]
    }).then(matchs =>{
        return res.status(200).json(matchs)
    })
}