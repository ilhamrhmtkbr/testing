<?php

namespace App\Actions;

use App\Helpers\ResponseApiHelper;
use App\Models\Forum;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ForumShowAction
{
    public function __invoke(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            // Log 1: Request masuk
            Log::info('ForumShowAction: Request received', [
                'course_id' => $request->input('course_id'),
                'has_auth' => auth()->check()
            ]);

            $valid = Validator::make($request->all(), [
                'course_id' => 'required|uuid',
            ]);

            if ($valid->fails()) {
                Log::warning('ForumShowAction: Validation failed', $valid->errors()->toArray());
                return ResponseApiHelper::send(
                    $valid->errors(),
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            $validated = $valid->validated();
            $courseId = $validated['course_id'];

            // Log 2: Cek auth user
            try {
                $user = auth()->user();
                Log::info('ForumShowAction: User authenticated', [
                    'user_id' => $user->getAuthIdentifier(),
                    'role' => $user->role
                ]);
            } catch (\Exception $authError) {
                Log::error('ForumShowAction: Auth failed', [
                    'error' => $authError->getMessage(),
                    'trace' => $authError->getTraceAsString()
                ]);
                throw $authError;
            }

            $userId = $user->getAuthIdentifier();

            // Log 3: Cek role & access
            if ($user->role === 'instructor') {
                Log::info('ForumShowAction: Checking instructor access');

                try {
                    $exists = DB::table('instructor_courses')
                        ->where('instructor_id', $userId)
                        ->where('id', $courseId)
                        ->exists();

                    Log::info('ForumShowAction: Instructor access result', ['has_access' => $exists]);

                    if (!$exists) {
                        return ResponseApiHelper::send(
                            'Anda tidak memiliki kursus ini',
                            Response::HTTP_FORBIDDEN
                        );
                    }
                } catch (\Exception $dbError) {
                    Log::error('ForumShowAction: DB query failed (instructor_courses)', [
                        'error' => $dbError->getMessage()
                    ]);
                    throw $dbError;
                }
            }

            if ($user->role === 'student') {
                Log::info('ForumShowAction: Checking student access');

                try {
                    $exists = DB::table('student_transactions')
                        ->where('instructor_course_id', $courseId)
                        ->where('student_id', $userId)
                        ->where('status', 'settlement')
                        ->exists();

                    Log::info('ForumShowAction: Student access result', ['has_access' => $exists]);

                    if (!$exists) {
                        return ResponseApiHelper::send(
                            'Anda tidak memiliki kursus ini',
                            Response::HTTP_FORBIDDEN
                        );
                    }
                } catch (\Exception $dbError) {
                    Log::error('ForumShowAction: DB query failed (student_transactions)', [
                        'error' => $dbError->getMessage()
                    ]);
                    throw $dbError;
                }
            }

            // Log 4: Query forum messages
            Log::info('ForumShowAction: Querying forum messages');

            try {
                $messagesQuery = Forum::where('course_id', $courseId);

                if ($request->has('before')) {
                    $messagesQuery->where('created_at', '<', Carbon::parse($request->query('before')));
                }

                $messages = $messagesQuery
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get();

                Log::info('ForumShowAction: Messages retrieved', ['count' => $messages->count()]);

                return ResponseApiHelper::send(
                    Lang::get('request-success.get_data_successfully'),
                    Response::HTTP_OK,
                    $messages
                );
            } catch (\Exception $forumError) {
                Log::error('ForumShowAction: Forum query failed', [
                    'error' => $forumError->getMessage(),
                    'trace' => $forumError->getTraceAsString()
                ]);
                throw $forumError;
            }

        } catch (\Exception $e) {
            Log::error('ForumShowAction: Unhandled exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return ResponseApiHelper::send(
                $e->getMessage(),
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
