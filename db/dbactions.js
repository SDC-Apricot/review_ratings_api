const db = require('./index.js');

async function getReviews(req, res) {
  const {product_id, count} = req.query;
  if (req.query.product_id !== '') {

    const reviews = await getData(product_id, count)
      .catch(err => res.send(err));

    const result = await Promise.all(reviews.map(async (review) => {
      let photos = await getReviewPhotos(review.id).catch(e => []);
      return {
        ...review,
        photos
      }
    }))

  res.send(result)
  } else {
    res.sendStatus(404)
  }
}

//gets record from reviews table
async function getData(id, count) {
  let stringQuery = `SELECT * FROM reviews WHERE product_id=${id}`;
  if (count) {
    stringQuery = stringQuery.concat(` LIMIT ${count}`)
  };
  return db.client.query(stringQuery).then(reviews => reviews.rows)
}

//gets records from review_photos table
async function getReviewPhotos(id) {
  let stringQuery = `SELECT id, url  FROM reviews_photos WHERE review_id = ${id}`
  return db.client.query(stringQuery).then(photos => photos.rows)
}

//gets Meta data
async function getMeta(req, res) {
  let results = { product_id: req.query.product_id }
  if (req.query.product_id !== '') {
    const { product_id } = req.query
     results.rating = await getRating(product_id)
     results.recommend = await getRecommend(product_id)
     results.characteristics = await getCharacteristics(product_id)

     res.send(results)
  } else {
    res.sendStatus(404)
  }
}

async function getCharacteristics(productId) {
  let stringQuery = `SELECT
                        c.name AS NAME,
                        c.id AS ID,
                        round(avg(cr.value)::numeric,2) AS AVG
                      FROM
                        characteristics AS c,
                        characteristic_reviews AS cr
                      WHERE
                        c.product_id=${productId} AND cr.characteristic_id = c.id
                      GROUP BY
                        c.id`
  return db.client.query(stringQuery)
    .then(results => {
      let allCharacteristics = {}
      results.rows.forEach(char => {
        allCharacteristics[char.name] = {"id": char.id, "value": char.avg}
      })
      return allCharacteristics;
    })
    .catch(err => console.log(err))
}

async function getRating(productId){
  let stringQuery = `SELECT
                      rating,
                      count(rating) AS count
                    FROM reviews
                    WHERE product_id = ${productId}
                    GROUP BY rating`
  return db.client.query(stringQuery)
    .then(results => {
      let ratingTally = {
        '1':0,
        '2':0,
        '3':0,
        '4':0,
        '5':0
      }

      results.rows.forEach(rating => {
        ratingTally[rating.rating] += Number(rating.count)
      })

      return ratingTally;
    })
    .catch(err => console.log(err))
}

async function getRecommend(productId) {
  let stringQuery = `SELECT
                      recommend,
                      count(recommend) AS count
                    FROM
                      reviews
                    WHERE
                      product_id=${productId}
                    GROUP BY recommend`

  return db.client.query(stringQuery)
    .then(results => {
      let recommend = {};
      results.rows.forEach(rec => {
        if (rec.recommend === true) {
          recommend["0"] = rec.count
        } else {
          recommend["1"] = rec.count
        }
      })
      return recommend
    })
    .catch(err => console.log(err))
}

//Posting reviews
async function postReviews(req, res) {
  //posts new reviews for product_id
  await addToReviews(req.body)
  await addToPhotos(req.body.photos)
  .catch(err => res.sendStatus(500))
  .then(() => res.sendStatus(200))
}

//adds to review table
async function addToReviews(data) {
  const {product_id, rating, summary, body, recommend, name, email} = data
  let stringQuery = `INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) VALUES (${product_id}, ${rating}, ${summary}, ${body}, ${recommend}, ${name}, ${email})`
  db.client
    .query(stringQuery)
    .catch(err => err)
}

//adds to review_photos table
async function addToPhotos(photoUrlList) {
  photoUrlList.forEach(url => {
  let stringQuery = `INSERT INTO reviews_photos (review_id, url) VALUES (${url})`
    db.client
    .query(stringQuery)
    .catch(err => err)
  })
}

//updates helpfulness on reviews table
function updateHelpfulness(req, res) {
  //update helpfulness by 1 of product_id
  let stringQuery = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id=${req.params.review_id}`
  db.client
    .query(stringQuery)
    .then(() => res.status(200))
    .catch(res.send(err))
}

//updates reported on reviews table
const reported = (req, res) => {
  //update report status of product_id
  console.log('reported')
  let stringQuery = `UPDATE reviews SET reported = true WHERE id=${req.params.product_id}`
  db.client
    .query(stringQuery)
    .then(() => res.sendStatus(200))
    .catch(res.send(err))
}


module.exports = {getReviews,
                  getMeta,
                  getData,
                  postReviews,
                  updateHelpfulness,
                  reported,
                  getReviewPhotos}