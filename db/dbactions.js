const db = require('./index.js');
const redis = require('redis');
const cred = require('./config.js')

const client = redis.createClient({
  host: cred.redis,
  port: cred.port
});


function cache (req, res, next) {
  const {product_id} = req.query;
  client.get(`Product_id: ${product_id}`, (err, reviews) => {
    if(err) throw err;
    if(reviews !== null) {
      res.send(JSON.parse(reviews));
    } else {
      next();
    }
  })
}

async function getReviews(req, res) {
  const {product_id, count} = req.query;

  try {
    if (product_id !== '') {
      let reviewData = await getData(product_id, count)
      let final = {
        "product": product_id,
        "results": reviewData
      };
      client.set(`Product_id: ${product_id}`, JSON.stringify(final))
      res.send(final)
    }
  } catch (err){
    res.sendStatus(404)
  }
}

async function getData(productId, count) {
  let stringQuery = `
    SELECT array_agg(row_to_json(a))
    FROM (
      SELECT id AS review_id,
      rating,
      summary,
      recommend,
      response,
      body,
      date,
      reviewer_name,
      helpfulness,
      (SELECT array_to_json(array_agg(row_to_json(b)))
        FROM (SELECT id, url FROM reviews_photos
          WHERE review_id=reviews.id)b) AS photos
      FROM reviews
    `

    if (count) {
      stringQuery = stringQuery.concat(` WHERE product_id=${productId} LIMIT ${count}) a;`)
    } else {
      stringQuery = stringQuery.concat(`WHERE product_id=${productId}) a;`)
    }


  return db.client.query(stringQuery)
    .then(results => results.rows[0].array_agg)
    .catch(err => console.error(err))
}

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

async function postReviews(req, res) {
  let reviewId;
  await addToReviews(req.body)
    .then(async review_id => {
      reviewId = review_id;
      return addToPhotos(review_id, req.body.photos)})
    .catch(err => console.log(err))

  let charRev = await addToCharacteristics(req.body.product_id, req.body.characteristics, reviewId)

  await addToCharacteristicsReviews(charRev, reviewId)
    .catch(err => console.log(err))

  .then(() => res.sendStatus(200))
  .catch(err => res.sendStatus(500))
}

async function addToReviews(data) {
  const {product_id, rating, summary, body, recommend, name, email} = data
  let stringQuery = `INSERT INTO
                      reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email)
                      VALUES (${product_id}, ${rating}, ${summary}, ${body}, ${recommend}, ${name}, ${email})
                      RETURNING id`
  return db.client
    .query(stringQuery)
    .then((results) => Number(results.rows[0].id))
    .catch(err => err)
}

async function addToCharacteristics(productId, characteristics) {
  let charRev = [];
  for (char in characteristics) {
    let stringQuery = `INSERT INTO
                        characteristics (product_id, name)
                      VALUES (${productId}, ${char})
                      RETURNING id`
    db.client
      .query(stringQuery)
      .then(async results => {
        let charId = results.rows[0].id
        charRev.push({characteristic_id: charId, value: characteristic[char]})
      })
      .then(() => charRev)
      .catch(err => console.log(err))
  }
}

async function addToCharacteristicsReviews(charRev, reviewId) {

  let insertValues = charRev.map(char => `(${char.characteristic_id}, ${reviewId}, ${char.value})`).join(',')
  let stringQuery = `INSERT INTO
                      characteristic_reviews (characteristic_id, review_id, value)
                    VALUES ${insertValues}`
  return db.client
    .query(stringQuery)
    .catch(err => console.log(err))
}

async function addToPhotos(review_id, photoList) {

  let insertValues = photoList.map(url => `(${review_id}, ${url})`).join(',')

  let stringQuery = `INSERT INTO
                      reviews_photo (review_id, url)
                    VALUES
                      ${insertValues}`

  return db.client.query(stringQuery)
    .catch(err => console.log(err))
}


function updateHelpfulness(req, res) {
  let stringQuery = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id=${req.params.review_id}`
  db.client
    .query(stringQuery)
    .then(() => res.status(200))
    .catch(res.send(err))
}

const reported = (req, res) => {
  console.log('reported')
  let stringQuery = `UPDATE reviews SET reported = true WHERE id=${req.params.product_id}`
  db.client
    .query(stringQuery)
    .then(() => res.sendStatus(200))
    .catch(res.send(err))
}


module.exports = {getReviews,
                  getMeta,
                  getCharacteristics,
                  getRating,
                  getRecommend,
                  getData,
                  postReviews,
                  updateHelpfulness,
                  reported,
                  cache
                }
