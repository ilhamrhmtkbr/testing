import { group, sleep } from 'k6';
import { register, login, logout } from "../helpers/auth.js";

// Data users dari JSON
const instructors = JSON.parse(open('../data/instructor.json'));
const students = JSON.parse(open('../data/student.json'));

// Utility function
function generateLowercaseString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Random user generator untuk register
function getRandomUserData() {
    const timestamp = Date.now();
    const random = generateLowercaseString(5);
    return {
        first_name: 'User',
        middle_name: 'Test',
        last_name: `${timestamp}`,
        username: `user${random}${timestamp}`,
        password: 'Test123!',
        password_confirmation: 'Test123!'
    };
}

// Flow 1: Register new user
export function registerFlow() {
    group('User Registration Flow', function () {
        const userData = getRandomUserData();

        const res = register(
            userData.first_name,
            userData.middle_name,
            userData.last_name,
            userData.username,
            userData.password,
            userData.password_confirmation
        );

        sleep(1);
        return res;
    });
}

// Flow 2: Login existing user
export function loginFlow() {
    group('User Login Flow', function () {
        // Random pilih antara instructor atau student
        const useInstructor = Math.random() > 0.5;
        const users = useInstructor ? instructors : students;
        const user = users[Math.floor(Math.random() * users.length)];

        const res = login(user.username, user.password);

        // Return token jika berhasil
        if (res.status === 200) {
            try {
                const token = res.cookies.access_token[0].value;
                sleep(1);
                return token;
            } catch (e) {
                console.log('Failed to parse token from response');
            }
        }

        sleep(1);
        return null;
    });
}

// Flow 3: Complete auth flow (register + login)
export function completeAuthFlow() {
    let token = null;

    // Step 1: Register
    group('Complete Auth Flow - Register', function () {
        const userData = getRandomUserData();

        const registerRes = register(
            userData.first_name,
            userData.middle_name,
            userData.last_name,
            userData.username,
            userData.password,
            userData.password_confirmation
        );

        if (registerRes.status === 200) {
            sleep(1);

            // Step 2: Login dengan user yang baru dibuat
            group('Complete Auth Flow - Login', function () {
                const loginRes = login(userData.username, userData.password);

                if (loginRes.status === 200) {
                    try {
                        const data = loginRes.json('data');
                        token = data.token;
                    } catch (e) {
                        console.log('Failed to get token after registration');
                    }
                }
            });
        }

        sleep(1);
    });

    return token;
}

// Flow 4: Login + Logout
export function loginLogoutFlow() {
    group('Login-Logout Flow', function () {
        // Login
        const token = loginFlow();

        if (token) {
            sleep(2); // Simulate some activity

            // Logout
            group('Logout', function () {
                logout(token);
                sleep(1);
            });
        }
    });
}