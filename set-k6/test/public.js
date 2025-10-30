import { browseCoursesFlow } from '../scenarios/public_flow.js';

export const options = {
    thresholds: {
        'http_req_duration': ['p(95)<1500', 'p(99)<3000'],
        'http_req_failed': ['rate<0.03'],
        'http_reqs': ['rate>8'],
        'checks': ['rate>0.92'],

        // Per-scenario
        'http_req_duration{scenario:browse}': ['p(95)<1000'],
        'http_req_duration{scenario:enroll}': ['p(95)<2000'],
        'http_req_duration{scenario:journey}': ['p(95)<2500'],

        'http_req_failed{scenario:browse}': ['rate<0.02'],
        'http_req_failed{scenario:enroll}': ['rate<0.03'],
        'http_req_failed{scenario:journey}': ['rate<0.05'],
    },

    scenarios: {
        // Quick enroll - high frequency
        quick_enroll: {
            executor: 'constant-arrival-rate',
            rate: 5, // 5 enrollments per second
            timeUnit: '1s',
            duration: '45s',
            preAllocatedVUs: 15,
            maxVUs: 25,
            exec: 'browseCoursesFlow',
            tags: { scenario: 'browse' },
            startTime: '0s',
        },

        // Student enroll journey
        student_enroll: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 8 },
                { duration: '40s', target: 12 },
                { duration: '20s', target: 3 },
                { duration: '10s', target: 0 },
            ],
            exec: 'browseCoursesFlow',
            tags: { scenario: 'enroll' },
            startTime: '50s',
        },

        // Complete user journey - realistic behavior
        user_journey: {
            executor: 'constant-vus',
            vus: 6,
            duration: '2m',
            exec: 'browseCoursesFlow',
            tags: { scenario: 'journey' },
            startTime: '140s',
        },
    },

    userAgent: 'K6-Public-API-Test/1.0',
    insecureSkipTLSVerify: true,
    noConnectionReuse: false,
    rps: 80,

    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
    summaryTimeUnit: 'ms',
};

export { browseCoursesFlow };

export default function () {
    browseCoursesFlow();
}

export function setup() {
    console.log('📚 Starting Public API Load Test');
    console.log('📊 Testing:');
    console.log('   - Get Courses');
    console.log('   - Enroll to Courses');
    console.log('   - View Course Content');
    console.log('');
    console.log('⏱️  Timeline:');
    console.log('   0s - 45s    : Quick Enroll (5 req/s)');
    console.log('   50s - 140s  : Student Enroll Journey');
    console.log('   140s - 260s : Complete User Journey (6 VUs)');
    console.log('');

    return { startTime: new Date().toISOString() };
}

export function teardown(data) {
    console.log('');
    console.log('✅ Public API Test Completed');
    console.log(`   Started: ${data.startTime}`);
    console.log(`   Ended: ${new Date().toISOString()}`);
}