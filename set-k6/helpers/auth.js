import http from 'k6/http';
import { check } from 'k6';
import { getCurrentScenario } from 'k6/execution';

const BASE_URL = 'http://backend-api-user:8000/user-api/v1/auth';

export function register(first_name, middle_name, last_name, username, password, password_confirmation) {
    const url = `${BASE_URL}/register`;
    const payload = JSON.stringify({
        first_name: first_name,
        middle_name: middle_name,
        last_name: last_name,
        username: username,
        password: password,
        password_confirmation: password_confirmation,
    });

    // ✅ Get scenario tag from current execution context
    const scenarioTag = getCurrentScenario().tags.scenario || 'unknown';

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'id'
        },
        tags: { 
            name: 'Register API',
            scenario: scenarioTag  // ✅ Add scenario tag
        },
        timeout: '10s'
    };

    const res = http.post(url, payload, params);

    check(res, {
        'register success (200)': (r) => r.status === 200,
        'response has success field': (r) => {
            try {
                return r.json('success') === true;
            } catch (e) {
                return false;
            }
        },
        'response time < 3s': (r) => r.timings.duration < 3000,
    });

    if (res.status !== 200) {
        console.log(`❌ Register failed [${scenarioTag}]: ${res.status} - ${res.body}`);
    }

    return res;
}

export function login(username, password) {
    const url = `${BASE_URL}/login`;
    const payload = JSON.stringify({
        username: username,
        password: password,
    });

    // ✅ Get scenario tag from current execution context
    const scenarioTag = getCurrentScenario().tags.scenario || 'unknown';

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'id'
        },
        tags: { 
            name: 'Login API',
            scenario: scenarioTag  // ✅ Add scenario tag
        },
        timeout: '10s'
    };

    const res = http.post(url, payload, params);

    check(res, {
        'login success (200)': (r) => r.status === 200,
        'response time < 5s': (r) => r.timings.duration < 5000,
    });

    if (res.status !== 200) {
        console.log(`❌ Login failed [${scenarioTag}]: ${res.status} - ${res.body}`);
    }

    return res;
}