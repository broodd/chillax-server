import request from 'supertest';
import app from '../src/app';

describe('POST /login', () => {
    it('should return 200 OK', () => {
        return request(app).post('/login')
            .field('email', 'test@gmail.com')
            .field('password', '12345')
            .expect(200);
    });
});

describe('POST /signup', () => {
    it('should return false -> email is not found', (done) => {
        return request(app).post('/signup')
            .field('name', 'John Doe')
            .field('email', 'john@me.com')
            .expect(400)
            .end(function (err, res) {
                const success = JSON.parse(res.error.text).success;
                expect(success).toBe(false);
                done();
            });
    });
    it('should return false -> email address already exists', (done) => {
        return request(app).post('/signup')
            .field('name', 'Tom')
            .field('email', 'test@gmail.com')
            .field('password', '12345')
            .expect(400)
            .end(function (err, res) {
                const success = JSON.parse(res.error.text).success;
                expect(success).toBe(false);
                done();
            });

    });
    it('should return false -> password too short', (done) => {
        return request(app).post('/signup')
            .field('name', 'Tom')
            .field('email', 'test_email@gmail.com')
            .field('password', '123')
            .expect(400)
            .end(function (err, res) {
                const message = JSON.parse(res.error.text).message;
                const firstError = message[0];
                expect(firstError.field).toBe('password');
                done();
            });

    });
});