import request from 'supertest';
import app from '../src/app';

describe('Health Check API', () => {
  it('should return 200 and API status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('API is running...');
  });
});
