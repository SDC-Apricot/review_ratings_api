const express = require('express')
const router = express.Router();
const dbAction = require('../db/dbactions.js')

router.get('/reviews', dbAction.getReviews)
router.get('/reviews/meta', dbAction.getMeta)
router.post('/reviews', dbAction.postReviews)
router.put('/reviews/:review_id/helpful', dbAction.updateHelpfulness)
router.put('/reviews/:review_id/report', dbAction.reported)


module.exports = router;