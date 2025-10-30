<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Tests\utils\Repository;

abstract class TestCase extends BaseTestCase
{
    protected static ?string $token = null;
    public string $url;

    protected function setUp(): void
    {
        parent::setUp();
        Repository::deleteInstructor();
        Repository::deleteStudent();
        Repository::insertInstructor();
        Repository::insertStudent();
        $this->url = config('api.version');

        if (self::$token === null) {
            $maxRetries = 3;
            $attempt = 0;

            while ($attempt < $maxRetries) {
                try {
                    $attempt++;
                    echo "\n🔑 Login attempt $attempt/$maxRetries...\n";

                    $res = Http::timeout(10)
                        ->retry(2, 100)
                        ->post('http://backend-api-user:8000/' . env('USER_API_VERSION') . '/auth/login', [
                            'username' => Repository::INSTRUCTOR_USERNAME,
                            'password' => Repository::INSTRUCTOR_PASSWORD
                        ]);
                    if ($res->successful()) {
                        $cookies = $res->header('Set-Cookie');
                        preg_match('/access_token=([^;]+)/', $cookies, $matches);
                        self::$token = $matches[1] ?? null;

                        if (self::$token !== null) {
                            echo "✅ Token obtained!\n";
                            break;
                        }
                    }

                    echo "⚠️ Attempt $attempt failed, retrying...\n";
                    sleep(2);
                } catch (\Exception $e) {
                    echo "❌ Attempt $attempt error: " . $e->getMessage() . "\n";
                    if ($attempt >= $maxRetries) {
                        throw $e;
                    }
                    sleep(2);
                }
            }

            if (self::$token === null) {
                throw new \Exception("Failed to obtain token after $maxRetries attempts");
            }
        }
    }

    protected function tearDown(): void
    {
        Repository::deleteInstructor();
        Repository::deleteStudent();
        parent::tearDown();
    }
}
