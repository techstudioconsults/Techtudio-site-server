const request = require('supertest');

const app = require('../server');

describe('Test the root path', () => {
    test('It should to the GET method', () => { 
        return request(app).get('/')
        .expect(200);
     })
})