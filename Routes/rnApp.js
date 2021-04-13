let router = require('express').Router();
const rnAppControllers = require('../Controllers/rnApp')


// url/
router.get('/', rnAppControllers.getIndex);
router.get("/match/:lobby",rnAppControllers.getMatch)
router.get("/matchById/:id",rnAppControllers.getMatchById)
router.get('/result/:lobby&:userId',rnAppControllers.getResult)
router.get('/zones',rnAppControllers.getZones)
router.get('/elo/:userId&:zoneId',rnAppControllers.getElo)
router.get('/classement/:zoneId',rnAppControllers.getClassement)
router.get('/coins/:userId',rnAppControllers.getCoins)
router.get('/game-markers',rnAppControllers.getGameMarkers)
router.get('/is-in-game/:id',rnAppControllers.getIsInGame)
router.get('/filleuls/:id',rnAppControllers.getFilleuls)

router.post('/register',rnAppControllers.postRegister)
router.post('/register-parrainage',rnAppControllers.postRegisterParrainage)
router.post('/login',rnAppControllers.postLogin)
router.post('/report',rnAppControllers.postReport)

router.post('/create-zone',rnAppControllers.postCreateZone)




// Export API routes
module.exports = router;