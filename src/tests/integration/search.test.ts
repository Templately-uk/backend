import supertest from 'supertest';
import app from '../../server';

const requestWithSupertest = supertest(app);
const route = '/search/meeting?categories=professional&order=desc&sort=views&offset=0&limit=1';

it('should return results in the correct format', async () => {
  const response = await requestWithSupertest.get(route);

  // Check status code
  expect(response.status).toBe(200);

  // Check structure of first result
  const firstResult = response.body.results.hits[0];
  expect(firstResult).toHaveProperty('id');
  expect(firstResult).toHaveProperty('route');
  expect(firstResult).toHaveProperty('title');
  expect(firstResult).toHaveProperty('summary');
  expect(firstResult).toHaveProperty('user');
  expect(firstResult.user).toHaveProperty('name');
  expect(firstResult.user).toHaveProperty('image');
  expect(firstResult).toHaveProperty('category');
  expect(firstResult.category).toHaveProperty('id');
  expect(firstResult.category).toHaveProperty('name');
  expect(firstResult).toHaveProperty('tags');
  expect(firstResult.tags[0]).toHaveProperty('name');
  expect(firstResult).toHaveProperty('aiTones');
  expect(firstResult).toHaveProperty('views');
  expect(firstResult).toHaveProperty('votes');
  expect(firstResult).toHaveProperty('createdAt');
  expect(firstResult).toHaveProperty('updatedAt');

  // Check other properties of response
  expect(response.body.results).toHaveProperty('totalHits');
  expect(response.body.results).toHaveProperty('totalPages');
  expect(response.body.results).toHaveProperty('currentPage');
  expect(response.body).toHaveProperty('timeTaken');
});
