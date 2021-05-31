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

exports.postRegisterParrainage = (req, res) => {
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
                            parrain:req.body.parrain
                        });
                        user.save()

                        User.findById(req.body.parrain).then(parrain => {
                            if(parrain){
                                parrain.filleuls.push(
                                    {user:user._id}
                                )
                                parrain.save()
                            }
                            return res.status(200).json({
                                success: true,
                            })
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
                pseudo: user.pseudo,
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
    const nom = "Bourgoin-Jallieu"
    const border = [{latitude:45.80384653665254, longitude: 5.2484882070780525},{latitude:45.709512706076055, longitude: 5.140697592366932},{latitude:45.62809247865523, longitude: 5.069667925206458},{latitude:45.48455759019935, longitude: 5.174343232727123},{latitude:45.48848899230929, longitude: 5.399893541550709},{latitude:45.558770351301845, longitude: 5.578713818183614},{latitude:45.73387219303321, longitude: 5.52637616704262}]


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

exports.getFilleuls = async (req,res) => {
    const userId = req.params.id
    User.findById(userId).then(async user => {
        var nbFilleulPlayed = 0
        for(filleul of user.filleuls){
            console.log(filleul)
            const filleul_ = await User.findById(filleul.user)
            if(filleul_.elos_historique.length > 1){
                nbFilleulPlayed++
            }
        }
        return res.status(200).json({nombre:nbFilleulPlayed})
    }).catch(err=>{
        console.log(err)
        return res.status(500).json({
            err:err
        })
    })
}

exports.postAvatar = (req,res,next) => {
    const userId = req.body.userId
    User.findById(userId).then(user=>{
        user.avatar= req.body.avatar
        user.save().then(r => {
            return res.status(200).json({
                success:true
            })
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            err:err
        })  
    })
}

exports.getAvatar = (req,res,next) => {
    const userId = req.params.userId
    User.findById(userId).then(user=>{
        if(user){
            return res.status(200).json({
                avatar:user.avatar
            })
        }
    })
}