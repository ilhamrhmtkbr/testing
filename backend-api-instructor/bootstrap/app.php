<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(function () {
        Route::prefix(config('api.version'))
            ->group(function () {
                Route::get('/storage/instructor-course-images/{filename}', function ($filename) {
                    // Validate filename format
                    if (!preg_match('/^[a-zA-Z0-9._-]+$/', $filename)) {
                        abort(404);
                    }

                    $path = storage_path('app/public/instructor-course-images/' . $filename);

                    if (!File::exists($path)) {
                        abort(404);
                    }

                    return response()->file($path);
                })->where('filename', '[a-zA-Z0-9._-]+');
            });
        Route::prefix(config('api.version'))
            ->middleware([
                'throttle:custom_limiter',
                \App\Http\Middleware\JwtMiddleware::class
            ])
            ->group(function () {
                require base_path('domain/Account/Route/api-v1.php');
                require base_path('domain/Answers/Route/api-v1.php');
                require base_path('domain/Courses/Route/api-v1.php');
                require base_path('domain/Coupons/Route/api-v1.php');
                require base_path('domain/Earnings/Route/api-v1.php');
                require base_path('domain/Lessons/Route/api-v1.php');
                require base_path('domain/Sections/Route/api-v1.php');
                require base_path('domain/Socials/Route/api-v1.php');
            });
    })
    ->withMiddleware(function (Middleware $middleware): void {
        //
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\AppLocaleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
