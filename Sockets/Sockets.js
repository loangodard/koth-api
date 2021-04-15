const geolib = require('geolib')
const User = require('../Models/User')
const Match = require('../Models/Match')
const calculateElo = require('../Utils/calculateElo')
const findZone = require('../Utils/findZone')

exports.manageSockets = (io) => {
    var rooms = [] //Liste des lobbys
    var rooms_end_game = [] //Liste des lobbys de salle de fin de partie

    io.on("connection", socket => {
        socket.on('disconnect', function() {
            console.log('Got disconnect!');
        });

        socket.on('reconnection',(data,cb) => {
            console.log("Reconnection")
            socket.join(data.room)
            var room_ind = rooms.findIndex(e => e.room_id == data.room) //On cherche l'index de la room dans la liste des rooms
            Match.findOne({lobby:data.room}).then(match=>{
                if(match){
                    io.to(data.room).emit('match_begin', rooms[room_ind].users)
                }else{
                    cb(rooms[room_ind].users)
                }
            })
            
        })

        socket.on('join_lobby', (data) => { //Lorsqu'un joueur join un lobby, on l'ajoute à sa room en fonction de l'id de la room rejoint
            console.log('lobby joined : ' + data.room + ' by : ' + data.userId)
            socket.join(data.room) //L'user rejoint la room donnée
            User.findById(data.userId).then(user => { //On récupère les infos du joueurs pour les passer aux autres joueurs
                findZone.findZone(data.position,zone=>{
                    if(!zone){
                        return socket.emit('wrong_zone')
                    }
                    const userEloInZoneIndex = user.elos.findIndex(e => e.zone == zone._id);
                    let userEloInZone
                    if(userEloInZoneIndex < 0){
                        // user.elos.push({
                        //     zone:zone._id,
                        //     elo:1000
                        // })
                        // user.save()
                        userEloInZone = 1000
                    }else{
                        userEloInZone = user.elos[userEloInZoneIndex].elo
                    }
                    const newUserInRoom = {
                        _id: user._id,
                        pseudo: user.pseudo,
                        elos: userEloInZone,
                        team: 1,
                        isReady: false,
                        position: data.position
                    }
                    var room_ind = rooms.findIndex(e => e.room_id == data.room) //On cherche l'index de la room dans la liste des rooms
                    if (room_ind < 0) { //Dans ce cas, c'est la création de la room
                        rooms.push({
                            room_id: data.room,
                            users: [newUserInRoom],
                            nbJoueursMax: data.nombreJoueurs
                        })
                        room_ind = rooms.length - 1
                    } else { //Dans ce cas, il rejoint une room déjà existente
                        const actual_room = rooms[room_ind]
                        const limiteJoueurs = actual_room.nbJoueursMax
    
                        //On prend le dernier joueur qui a rejoint et on regarde s'il est à moins de 500m(pou laisser une marge d'erreur à la localisation) du joueur souhaitant rejoindre
                        const userJoiningPosition = {
                            latitude: Number(newUserInRoom.position.latitude),
                            longitude: Number(newUserInRoom.position.longitude)
                        }
                        const previousUserPosition = {
                            latitude: Number(actual_room.users[actual_room.users.length - 1].position.latitude),
                            longitude: Number(actual_room.users[actual_room.users.length - 1].position.longitude)
                        }
    
                        if (geolib.getDistance(userJoiningPosition, previousUserPosition) > 500) {
                            return socket.emit('wrong_location')
                        }
    
    
                        //Si le lobby est plein, on emet une erreur
                        if (actual_room.users.length >= limiteJoueurs) {
                            return socket.emit('lobby_full')
                        }
    
                        //On calcul dans quelle équipe il doit aller, équipe 1 si nombre de joueurs pairs, 2 sinon
                        if (actual_room.users.length % 2 != 0) {
                            newUserInRoom.team = 2
                        }
    
                        actual_room.users.push(newUserInRoom)
                        rooms[room_ind] = actual_room
    
                    }
                    console.log(rooms[room_ind].users)
                    io.to(data.room).emit('user_joined', rooms[room_ind].users) //On dit aux autres joueurs qu'un joueur a rejoint on leur redonnant les données de chacuns + celles du nouveau joueur
                })
            })
        })

        socket.on('leave_lobby', (data) => {
            var room_ind = rooms.findIndex(e => e.room_id == data.room) //On cherche l'index de la room dans la liste des rooms
            const actual_room = rooms[room_ind]
            if (!actual_room) {
                return
            }
            const newUsers = actual_room.users.filter(e => e._id != data.userId)
            console.log(newUsers)
            actual_room.users = newUsers
            rooms[room_ind] = actual_room
            socket.leave(data.room)
            io.to(data.room).emit('user_leaved', rooms[room_ind].users) //On dit aux autres joueurs qu'un joueur a quitté en leur redonnant les données des joueurs, en enlevant le joueur qui quitte
        })

        socket.on('change_team', (data) => {
            var room_ind = rooms.findIndex(e => e.room_id == data.room) //On cherche l'index de la room dans la liste des rooms
            const actual_room = rooms[room_ind]
            let userChangeTeamInd = actual_room.users.findIndex(user => user._id == data.userId)
            var userChangeTeam = actual_room.users[userChangeTeamInd]
            userChangeTeam.isReady = false
            if (userChangeTeam.team == 1) {
                userChangeTeam.team = 2
            } else {
                userChangeTeam.team = 1
            }
            actual_room.users[userChangeTeamInd] = userChangeTeam
            io.to(data.room).emit('joueur_changed_team', rooms[room_ind].users)
        })

        socket.on('ready', (data) => {
            var room_ind = rooms.findIndex(e => e.room_id == data.room) //On cherche l'index de la room dans la liste des rooms
            const actual_room = rooms[room_ind]
            let userReadyInd = actual_room.users.findIndex(user => user._id == data.userId)
            let userReady = actual_room.users[userReadyInd]
            if (!userReady) {
                return
            }
            userReady.isReady = !userReady.isReady
            actual_room.users[userReadyInd] = userReady
            // Si tous les joueurs sont prêt et que la partie est pleine, on lance la partie
            const joueursReady = actual_room.users.filter(e => e.isReady)
            const team1 = actual_room.users.filter(e => e.team == 1)
            const team2 = actual_room.users.filter(e => e.team == 2)
            if (joueursReady.length == actual_room.nbJoueursMax && team1.length == team2.length) {
                findZone.findZone(actual_room.users[0].position,zone => {
                    const match = new Match({
                        lobby: actual_room.room_id,
                        team1: team1.map(e => e._id),
                        team2: team2.map(e => e._id),
                        date_debut: new Date(),
                        position: actual_room.users[0].position,
                        zone:zone._id
                    })
                    match.save()
                    io.to(data.room).emit('match_begin', rooms[room_ind].users)
                })
            } else { //si non on indique juste aux autres que le joueur est prêt
                io.to(data.room).emit('user_ready', rooms[room_ind].users)
            }
        })

        /**
         * Gestion des votes et fin de partie
         */
        socket.on('join_end_game', (data,cb) => {
            socket.join(data.room) //On connecte les joueurs entre eux
            var roomInd = rooms_end_game.findIndex(e => e.lobby == data.room)
            if (roomInd < 0) { //Dans ce cas c'est le premier joueur à rejoindre
                console.log('premier joueur à rejoindre le vote...')
                rooms_end_game.push({
                    lobby: data.room,
                    votes: [{
                        joueur: data.userId,
                        vote: data.vote,
                    }],
                    isTimerSet: false
                })
                roomInd = rooms_end_game.length - 1
            } else {
                var new_room = rooms_end_game[roomInd]
                var new_votes = new_room.votes
                var isTimerSet = new_room.isTimerSet
                //Si deux joueurs ou plus ont votés, on lance un timeur de 5 minutes
                if (new_votes.length > 0 && !isTimerSet) {
                    const timer = setTimeout(() => {
                        //Fin de la partie, tant pis pour les autres qui n'ont pas votés
                        //à implémenter
                    }, (1 / 4) * 60000)
                    isTimerSet = true
                }

                new_votes.push({
                    joueur: data.userId,
                    vote: data.vote
                })

                rooms_end_game[roomInd] = {
                    lobby: data.room,
                    votes: new_votes,
                    isTimerSet: isTimerSet
                }
            }
            console.log(rooms_end_game)
            console.log(roomInd)

            Match.findOne({
                lobby: data.room
            }).populate('team1', 'pseudo elos').populate('team2', 'pseudo elos').then(match => {
                var nombreJoueurs = match.team1.length + match.team2.length
                var votes = rooms_end_game[roomInd].votes
                match.votes = votes
                if (votes.length == nombreJoueurs) {
                    //Fin des votes et ont calcul le winner
                    var vote1 = votes.filter(e => e.vote == 1)
                    var vote2 = votes.filter(e => e.vote == 2)
                    let winner
                    if (vote1.length > vote2.length) {
                        console.log("Team 1 win")
                        winner = 1
                        match.winner = 1
                    } else if (vote1.length < vote2.length) {
                        console.log("Team 2 win")
                        winner = 2
                        match.winner = 2
                    } else {
                        winner = 0
                        match.winner = 0
                    }

                    //On calcul le gain_perte d'elo pour chaque joueur
                    // https://ryanmadden.net/posts/Adapting-Elo
                    calculateElo.calculateElo(winner, match.team1, match.team2, match).then(r => {
                        match.gain_perte = r
                        match.winner = winner
                        match.isGameOver = true
                        match.save().then(match => {
                            socket.to(data.room).emit('voted')
                            return cb(true);
                        })
                    })
                } else {
                    console.log('en attente de votes')
                    return cb(false)
                }
            })
        })

        socket.on('reconnection_end_game',(data,cb)=> {
            console.log(data.room)
            Match.findOne({lobby:data.room}).then(match => {
                if(match.isGameOver){
                    cb(true)
                }else{
                    cb(false)
                }
            })
        })
    })
}