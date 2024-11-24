const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Driver API Endpoints', () => {
  test('DELETE /api/users/drivers/:id', async () => {
    // Create a test driver first
    const testDriver = await Driver.create({
      name: 'Test Driver',
      email: 'test@example.com'
    });

    const response = await request(app)
      .delete(`/api/users/drivers/${testDriver._id}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Driver deleted successfully');
  });
}); 