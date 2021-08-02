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

async function getData(id, count) {
  let stringQuery = `SELECT * FROM reviews WHERE product_id=${id}`;
  if (count) {
    stringQuery.concat(`LIMIT ${count}`)
  };
  return db.client.query(stringQuery).then(reviews => reviews.rows)
}

async function getReviewPhotos(id) {
  let stringQuery = `SELECT id, url  FROM reviews_photos WHERE review_id = ${id}`
  return db.client.query(stringQuery).then(photos => photos.rows)
}


async function getMeta(req, res) {
  //check if required params are provided
  if (req.query.product_id !== '') {
    let stringQuery = `SELECT * FROM characteristics WHERE product_id=${req.query.product_id}`
    db.client
    .query(stringQuery)
    .then(results => res.send(results.rows))
    .catch(err => res.send(err))
  } else {
    res.sendStatus(404)
  }
}

async function postReviews(req, res) {
  //posts new reviews for product_id
  await addToReviews(req.body);
  await addToPhotos(req.body,photos);
}

async function addToReviews(data) {
  const {product_id, rating, summary, body, recommend, name, email} = data
  let stringQuery = `INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email) VALUES (${product_id}, ${rating}, ${summary}, ${body}, ${recommend}, ${name}, ${email})`
  db.client
    .query(stringQuery)
    .catch(err => err)
}

async function addToPhotos(photoUrlList) {
  photoUrlList.forEach(url => {
  let stringQuery = `INSERT INTO reviews_photos (review_id, url) VALUES (${url})`
    db.client
    .query(stringQuery)
    .catch(err => err)
  })
}

function updateHelpfulness(req, res) {
  //update helpfulness by 1 of product_id
  let stringQuery = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id=${req.query.id} AND product_id=${req.query.product_id}`
  db.client
    .query(stringQuery)
    .then(() => res.status(200))
    .catch(res.send(err))
}

const reported = (req, res) => {
  //update report status of product_id
  let stringQuery = `UPDATE reviews SET reported = true WHERE id=${req.query.product_id}`
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