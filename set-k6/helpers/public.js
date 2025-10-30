import http from 'k6/http';
import { check } from 'k6';
import { getCurrentScenario } from 'k6/execution';

export function getCourses(token) {
    const url = `http://backend-api-public:8000/public-api/v1/courses`;
    
    // ✅ Get scenario tag from current execution context
    const scenarioTag = getCurrentScenario().tags.scenario || 'unknown';
    
    const params = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
        tags: { 
            name: 'Get Courses API',
            scenario: scenarioTag  // ✅ Add scenario tag
        }
    };
    
    const res = http.get(url, params);
    
    check(res, { 
        'get courses status is 200': (r) => r.status === 200 
    });
    
    return res.json();
}