const { expect } = require("@jest/globals");
const server = require('./server/app.js');
const db = require('./db/dbactions.js');
const axios = require('axios');

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
    let photos = await db.getReviewPhotos(5)
    expect(photos.length).toBe(3);
    expect(typeof photos[0].id).toBe('number')
  })
  test("Photo list", async () => {
    let photos = await db.getReviewPhotos(5)
    expect(photos.length).toBe(3);
    expect(typeof photos[0].url).toBe('string')
  })
  test("Photo list", async () => {
    let photos = await db.getReviewPhotos(5)
    expect(photos.length).toBe(3);
    expect(typeof photos).toBe('object')
  })

})


describe('Gets review from DB', () => {

  test('An object is selected', async () => {
    let test = await db.getData(2, 1);
    expect(typeof test[0]).toBe('object');
  })

  test('First Record ID is 1', async () => {
    let test = await db.getData(2, 5);
    expect(test[0].id).toBe(1);
  })

  test('First Record body is a string', async () => {
    let test = await db.getData(2, 5);
    expect(typeof test[0].body).toBe('string')
  })
})