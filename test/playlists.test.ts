import request from 'supertest';
import app from '../src/app';

let token: string;

beforeAll((done) => {
    request(app)
        .post('/login')
        .send({
            email: 'test@gmail.com',
            password: '12345',
        })
        .end((err, res) => {
            token = res.body.token;
            done();
        });
});

describe('GET /playlists', () => {
    it('should return 200 & plyalists', () => {
        return request(app).get('/playlists')
            .set('Authorization', token)
            .expect(200);
    });
});

describe('GET /playlist', () => {
    it('should return 500 -> bad id', () => {
        return request(app).get('/playlist/123')
            .set('Authorization', token)
            .expect(500);
    });
});