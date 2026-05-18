const request = require('supertest')
const app = require('./index')

describe('server health check', () => {
  it('responds with ok status', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true })
  })
})
