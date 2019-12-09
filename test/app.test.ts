import request from 'supertest';
import app from '../src/app';

describe('GET /404', () => {
    it('should return 404', () => {
        return request(app).get('/404')
            .expect(404);
    });
});