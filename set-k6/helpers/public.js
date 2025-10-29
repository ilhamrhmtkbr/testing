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

export function enrollCourse(token, courseId) {
    const url = `http://backend-api-public/public-api/v1/courses/${courseId}/enroll`;
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
        tags: { name: 'Enroll Course API' }
    };
    const res = http.post(url, null, params); // POST request tanpa body
    check(res, {
        'enroll course status is 200/201': (r) => r.status === 200 || r.status === 201 || r.status === 409 // 409 jika sudah enroll
    });
    return res;
}

export function viewCourseContent(token, courseId) {
    const url = `http://backend-api-public/public-api/v1/courses/${courseId}/content`;
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
        tags: { name: 'View Course Content API' }
    };
    const res = http.get(url, params);
    check(res, { 'view course content status is 200': (r) => r.status === 200 });
    return res;
}