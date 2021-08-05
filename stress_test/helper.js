function randomProd(context, event, done){
  const id = Math.floor(Math.random() * (1000011 - 900000 + 1) + min)
  context.vars['id'] = id;
  return done();
}

module.exports = { randomProd };