const { expect } = require("@jest/globals");

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