const express = require('express');

const router = express.Router();

const PSIControllers = require('../Controllers/PhysicalShopItem');

const PSI = require('../Models/PhysicalShopItem');

router.post( '/', PSIControllers.createPSI);

router.get('/', PSIControllers.getAllPSI);

router.get('/:id', PSIControllers.getOnePSI);

router.put('/:id', PSIControllers.updatePSI);

router.delete('/:id', PSIControllers.deletePSI);


module.exports = router;