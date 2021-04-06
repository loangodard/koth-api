const PSI = require('../Models/PhysicalShopItem');

exports.createPSI( (req,res,next) => {
    const psi = new PSI ({
        nom: req.body.nom,
        description: req.body.description,
        imageURL: req.body.imageURL,
        moneyCost: req.body.moneyCost 
     });
     psi.save()
         .then(  () => {
             res.status(201).json({
               message: 'PhysicalShopItem saved successfully!'
             });
           }
         )
         .catch(
           (error) => {
             res.status(400).json({
               error: error
             });
           }
         );
});

exports.getOnePSI( (req,res,next) => {
    PSI.findOne({_id: req.params.id})
        .then( (psi) => {
          res.status(200).json(psi)
        })
        .catch( (error) => {
          res.status(404).json({error:error})
        });
});

exports.getAllPSI((req,res,next) => {
    PSI.find()
        .then( (psis) => {
          res.status(200).json(psis)
        })
        .catch( 
          (error) => {
            res.status(400).json({error: error})
          });
});

exports.updatePSI((req,res,next) => {
    const psi = new PSI ({
      _id: req.params.id,
      nom: req.body.nom,
      description: req.body.description,
      imageURL: req.body.imageURL,
      moneyCost: req.body.moneyCost
    });
    PSI.updateOne({_id: req.params.id}, psi)
      .then( () => {
        res.status(201).json({
          message: 'PSI successfully updated'
        })
      })
      .catch( (error) => {
        res.status(400).json({error: error})
      });
});

exports.deletePSI((req,res,next) => {
    PSI.deleteOne({_id: req.params.id})
      .then(() => {
        res.status(200).json({message:'PSI deleted'})
      })
      .catch( (error) => {
        res.status(400).json({error:error})
      });
});