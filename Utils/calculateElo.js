const User = require('../Models/User')
const findZone = require('../Utils/findZone')

exports.calculateElo = async (winner,team1,team2,match) => {
    return new Promise(async (successCb, failureCb)=>{
        let gain_perte = []

        let meanEloTeam1 = 0;
        for(joueur of team1){
            let eloJoueurIndex = joueur.elos.findIndex(e => e.zone == match.zone)
            if(eloJoueurIndex < 0){
                meanEloTeam1 += 1000 //Dans ce cas le joueur a 1000 elo car il n'a jamais joué dans cette zone
            }else{
                meanEloTeam1 += joueur.elos[eloJoueurIndex].elo
            }
        }
        meanEloTeam1 = (meanEloTeam1/team1.length) || 0

        let meanEloTeam2 = 0;
        for(joueur of team2){
            let eloJoueurIndex = joueur.elos.findIndex(e => e.zone == match.zone)
            if(eloJoueurIndex < 0){
                meanEloTeam2 += 1000 //Dans ce cas le joueur a 1000 elo car il n'a jamais joué dans cette zone
            }else{
                meanEloTeam2 += joueur.elos[eloJoueurIndex].elo
            }
        }
        meanEloTeam2 = (meanEloTeam2/team2.length) || 0


        if(winner == 1){
            for(joueur of team1){
                const user = await User.findById(joueur._id)
                user.coins += 10
                const userEloInZoneIndex = user.elos.findIndex(e => e.zone == match.zone);
                let newUserEloInZone;
                if(userEloInZoneIndex < 0){
                    newUserEloInZone = {
                        elo:1000,
                        zone:match.zone
                    }
                }else{
                    newUserEloInZone = user.elos[userEloInZoneIndex]
                }

                console.log("NEWUSERELOINZONE : ")
                console.log(newUserEloInZone)

                const ExpectationToWin = 1/(1+10**((meanEloTeam2-newUserEloInZone.elo)/400));

                console.log("EXEPCTATION TO WIN : ")
                console.log(ExpectationToWin)
                gain_perte.push({
                    joueur:user._id,
                    gain_elos: Math.trunc(20*(1-ExpectationToWin)),
                    gain_coins: 10,
                })
                user.elos_historique.push({zone:match.zone,date:new Date(),elos:newUserEloInZone.elo + Math.trunc(20*(1-ExpectationToWin))})
                newUserEloInZone.elo += Math.trunc(20*(1-ExpectationToWin))

                if(userEloInZoneIndex < 0){
                    user.elos.push(newUserEloInZone)
                }else{
                    user.elos[userEloInZoneIndex] = newUserEloInZone
                }
                user.save()
            }
    
            for(joueur of team2){
                const user = await User.findById(joueur._id)
                user.coins += 10
                const userEloInZoneIndex = user.elos.findIndex(e => e.zone == match.zone);
                let newUserEloInZone;
                if(userEloInZoneIndex < 0){
                    newUserEloInZone = {
                        elo:1000,
                        zone:match.zone
                    }
                }else{
                    newUserEloInZone = user.elos[userEloInZoneIndex]
                }
                const ExpectationToWin = 1/(1+10**((meanEloTeam1-newUserEloInZone.elo)/400));
                gain_perte.push({
                    joueur:user._id,
                    gain_elos: Math.trunc(20*(0-ExpectationToWin)),
                    gain_coins: 10,
                })
                user.elos_historique.push({zone:match.zone,date:new Date(),elos:newUserEloInZone.elo + Math.trunc(20*(0-ExpectationToWin))})
                newUserEloInZone.elo += Math.trunc(20*(0-ExpectationToWin))

                if(userEloInZoneIndex < 0){
                    user.elos.push(newUserEloInZone)
                }else{
                    user.elos[userEloInZoneIndex] = newUserEloInZone
                }
                user.save()
            }
        }else if(winner == 2){
            for(var joueur of team1){
                const user = await User.findById(joueur._id)
                user.coins += 10
                const userEloInZoneIndex = user.elos.findIndex(e => e.zone == match.zone);
                let newUserEloInZone;
                if(userEloInZoneIndex < 0){
                    newUserEloInZone = {
                        elo:1000,
                        zone:match.zone
                    }
                }else{
                    newUserEloInZone = user.elos[userEloInZoneIndex]
                }
                const ExpectationToWin = 1/(1+10**((meanEloTeam2-newUserEloInZone.elo)/400));
                gain_perte.push({
                    joueur:user._id,
                    gain_elos: Math.trunc(20*(0-ExpectationToWin)),
                    gain_coins: 10,
                })
                user.elos_historique.push({zone:match.zone,date:new Date(),elos:newUserEloInZone.elo + Math.trunc(20*(0-ExpectationToWin))})
                newUserEloInZone.elo += Math.trunc(20*(0-ExpectationToWin))

                if(userEloInZoneIndex < 0){
                    user.elos.push(newUserEloInZone)
                }else{
                    user.elos[userEloInZoneIndex] = newUserEloInZone
                }
                user.save()
            };
    
            for(var joueur of team2){
                const user = await User.findById(joueur._id)
                user.coins += 10
                const userEloInZoneIndex = user.elos.findIndex(e => e.zone == match.zone);
                let newUserEloInZone;
                if(userEloInZoneIndex < 0){
                    newUserEloInZone = {
                        elo:1000,
                        zone:match.zone
                    }
                }else{
                    newUserEloInZone = user.elos[userEloInZoneIndex]
                }
                const ExpectationToWin = 1/(1+10**((meanEloTeam1-newUserEloInZone.elo)/400));
                gain_perte.push({
                    joueur:user._id,
                    gain_elos: Math.trunc(20*(1-ExpectationToWin)),
                    gain_coins: 10,
                })
                user.elos_historique.push({zone:match.zone,date:new Date(),elos:newUserEloInZone.elo + Math.trunc(20*(1-ExpectationToWin))})
                newUserEloInZone.elo += Math.trunc(20*(1-ExpectationToWin))

                if(userEloInZoneIndex < 0){
                    user.elos.push(newUserEloInZone)
                }else{
                    user.elos[userEloInZoneIndex] = newUserEloInZone
                }
                user.save()
            }
        }else{
            for(var joueur of team1){
                gain_perte.push({
                    joueur:joueur,
                    gain_elos: 0,
                    gain_coins: 0
                })
            }
            for(var joueur of team2){
                gain_perte.push({
                    joueur:joueur,
                    gain_elos: 0,
                    gain_coins: 0
                })
            }
        }
        successCb(gain_perte)
    })
}