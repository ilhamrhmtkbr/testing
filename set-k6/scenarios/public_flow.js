import { group, sleep } from 'k6';
import { getCourses } from '../helpers/public.js';

// Flow 1: Browse courses (tanpa login - public)
export function browseCoursesFlow() {
    group('Browse Courses (Public)', function () {
        // Get all courses
        const courses = getCourses(null); // null = no token (public)
        sleep(2);

        return courses;
    });
}