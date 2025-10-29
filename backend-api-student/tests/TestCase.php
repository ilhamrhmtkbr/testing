<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\utils\Repository;

abstract class TestCase extends BaseTestCase
{
    public string $token;
    public string $url;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear data dulu sebelum init untuk memastikan state bersih
        Repository::clearData();
        Repository::initData();

        $this->url = config('api.version');
        $this->token = $this->getAuthToken();
    }

    protected function tearDown(): void
    {
        Repository::clearData();

        // Reset token
        $this->token = '';

        parent::tearDown();
    }

    /**
     * Get authentication token with retry mechanism
     */
    private function getAuthToken(int $maxRetries = 3): string
    {
        $attempt = 0;
        $lastException = null;

        while ($attempt < $maxRetries) {
            try {
                $res = Http::timeout(10)
                    ->post(
                        'http://backend-api-user:8000/' . env('USER_API_VERSION') . '/auth/login',
                        [
                            'username' => Repository::USERNAME,
                            'password' => Repository::PASSWORD
                        ]
                    );

                if (!$res->successful()) {
                    throw new \Exception("Login failed with status: {$res->status()}");
                }

                $cookies = $res->header('Set-Cookie');

                if (empty($cookies)) {
                    throw new \Exception('No Set-Cookie header found');
                }

                preg_match('/access_token=([^;]+)/', $cookies, $matches);

                if (empty($matches[1])) {
                    throw new \Exception('access_token not found in cookies');
                }

                Log::info('✅ Authentication successful', [
                    'attempt' => $attempt + 1,
                    'token_length' => strlen($matches[1])
                ]);

                return $matches[1];

            } catch (\Exception $e) {
                $lastException = $e;
                $attempt++;

                Log::warning('⚠️ Auth attempt failed', [
                    'attempt' => $attempt,
                    'error' => $e->getMessage()
                ]);

                if ($attempt < $maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    sleep(pow(2, $attempt - 1));
                }
            }
        }

        // Jika semua attempt gagal
        $errorMsg = "Failed to get auth token after {$maxRetries} attempts. Last error: "
            . ($lastException ? $lastException->getMessage() : 'Unknown');

        Log::error('❌ Authentication failed', [
            'error' => $errorMsg
        ]);

        throw new \RuntimeException($errorMsg);
    }
}
