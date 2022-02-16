const db = require("../db/connection");
const request = require("supertest");
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const app = require('../app');
const { RowDescriptionMessage } = require("pg-protocol/dist/messages");

beforeEach(() => seed(testData));
afterAll(() => db.end());


describe('/api/topics', () => {
    describe('GET', () => {
        test('should return status 200 and an object with an array of objects', () => {
            return request(app)
            .get('/api/topics')
            .expect(200)
            .then((response) => {
                expect(response.body.results).toHaveLength(3)
                expect(Array.isArray(response.body.results)).toBe(true)
                response.body.results.forEach((slug) => 
                expect(slug).toEqual(
                    expect.objectContaining({
                        description: expect.any(String),
                        slug: expect.any(String)
                    })
                ))
            })
        })

    })
})

describe('/api/articles/:article_id', () => {
    describe('GET', () => {
        test('should return status 200 and an object containing a single object', () => {
            const articleId = 1;            
            return request(app)
            .get(`/api/articles/${articleId}`)
            .expect(200)
            .then((response) => {
                //console.log(response.body)
                expect(response.body.articleObj).toEqual(
                    expect.objectContaining({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        body: expect.any(String),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number)
                    })
                )
            })
        })
    })
    describe('PATCH', () => {
        test('should return status 200 and an object containing updated article', () => {
            const incVotes = { inc_votes: 10 };
            return request(app)
            .patch('/api/articles/1')
            .send(incVotes)
            .expect(200)
            .then((response) => {
                expect(response.body.articleObj).toEqual({
                    author: 'butter_bridge',
                    title: 'Living in the shadow of a great man',
                    article_id: 1,
                    body: 'I find this existence challenging',
                    topic: 'mitch',
                    created_at: '2020-07-09T20:11:00.000Z',
                    votes:110
                })
            })
        })
    })
    describe('error handling', () => {
        describe('bad request invalid article id', () => {
            test('returns status 400 and message "Invalid id"', () => {
                return request(app)
                .get('/api/articles/invalidId')
                .expect(400)
                .then((response) => {
                    expect(response.error.text).toBe('Invalid id')
                })
            })
        })
        describe('article does not exist', () => {
            test('returns status 404 and message "Article does not exist"', () => {
                return request(app)
                .get('/api/articles/999')
                .expect(404)
                .then((response) => {
                    expect(response.error.text).toBe('Article not found')
                })
            })
        })
        describe('body missing required fields', () => {
            test('returns status 404 and message "Bad request - invalid input"', () => {
                const inc_votes = {};
                return request(app)
                .patch('/api/articles/1')
                .send(inc_votes)
                .expect(404)
                .then((response) => {
                    expect(response.error.text).toBe('Bad request - invalid input')
                })

             })
        })
        describe('input incorrect type', () => {
            test('returns status 404 and message "Bad request - invalid input', () => {
                const inc_votes = { inc_votes: 'A string' };
                return request(app)
                .patch('/api/articles/1')
                .send(inc_votes)
                .expect(404)
                .then((response) => {
                    console.log(response)
                    expect(response.error.text).toBe('Bad request - invalid input')
                })
            })
        })
    })
})


describe('invalid path', () => {
    test('returns status 404 error message when path not found', () => {
        return request(app)
        .get('/api/invalid')
        .expect(404)
        .then((response) => {
            expect(response.error.text).toBe('Path not found')
        })
    })
})


