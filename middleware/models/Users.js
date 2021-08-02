const Users = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Users',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    did: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    safes: { type: 'array' },
    userAddress: {type: 'string'}
  },
};

module.exports = Users;
