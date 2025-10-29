import http from 'k6/http';
import { check } from 'k6';

export function getCourses(token) {
    const url = `http://backend-api-public/public-api/v1/courses`;
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
        tags: { name: 'Get Courses API' }
    };
    const res = http.get(url, params);
    check(res, { 'get courses status is 200': (r) => r.status === 200 });
    return res.json();
}