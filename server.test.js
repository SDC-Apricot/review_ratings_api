const { expect } = require("@jest/globals");
const server = require("./server/app.js");
const dbActions = require("./db/dbactions.js");
const db = require("./db/index.js");
const request = require("supertest");
const app = require("./server/app.js");

describe('This is just a test', () => {
  function add(a, b){
    return a + b
  }

  test('First test', () => {
    const test = add(1, 2)
    expect(test).toBe(3);
  });

  test('2nd test', () => {
    const anotherTest = add(NaN, 3)
    expect(anotherTest).toBeNaN();
  });

});


describe('Gets review photos from DB', () => {

  test("Photo list", async () => {
    let photos = await dbActions.getReviewPhotos(5)
    expect(photos.length).toBe(3);
    expect(typeof photos[0].id).toBe('number')
  })
  test("Photo list", async () => {
    let photos = await dbActions.getReviewPhotos(5)
    expect(photos.length).toBe(3);
    expect(typeof photos[0].url).toBe('string')
  })
  test("Photo list", async () => {
    let photos = await dbActions.getReviewPhotos(5)
    expect(photos.length).toBe(3);
    expect(typeof photos).toBe('object')
  })

})


describe('Gets review from DB', () => {

  test('An object is selected', async () => {
    let test = await dbActions.getData(2, 1);
    expect(typeof test[0]).toBe('object');
  })

  test('First Record ID is 1', async () => {
    let test = await dbActions.getData(2, 5);
    expect(test[0].id).toBe(3);
  })

  test('First Record body is a string', async () => {
    let test = await dbActions.getData(2, 5);
    expect(typeof test[0].body).toBe('string')
  })
})


describe('GET request', () => {
  test('Get requests return properly', (done) => {
     request(app)
      .get('/reviews')
      .query({product_id: 1000011})
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length > 0).toBe(true);
        done();
      })
      .catch(err => console.log(err))
      done();
  })
})

describe('Helpfulness update', () => {
  test('Put request to update Helpfuless in reviews', (done) => {
    let id = 5774952;
    let original;
    db.client.query(`SELECT helpfulness FROM reviews WHERE id=${id}`)
      .then((results) => {original = results.rows[0].helpfulness})
      .then(() => {
        request(app)
        .put('/reviews/5774952/helpful')
        .then(()=>{
          db.client.query(`SELECT helpfulness FROM reviews WHERE id=${id}`)
          .then((results) => {
            expect(original !== results.rows[0].helpfulness).toBe(true);
            done()
          })
        })
      })
      .catch(err => console.log(err))
  })
})

describe('Reported update', () => {
  test('Put request to update reported in reviews', (done) =>{
    let id = 1002;
    let original;
    db.client.query(`SELECT reported FROM reviews WHERE id=${id}`)
      .then((results) => {original = results.row[0].reported})
      .then(() => {
        request(app)
        .put('/reviews/1002/report')
        .then(()=>{
          db.client.query(`SELECT reported FROM reviews WHERE id=${id}`)
          .then((results) => {
            expect(original !== results.rows[0].reported).toBe(true);
            done()
          })
        })
      })
      .catch(err => console.log(err))
  })
})