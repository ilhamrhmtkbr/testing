<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Tests\utils\Repository;

abstract class TestCase extends BaseTestCase
{
    protected static ?string $token = null; // 👈 Ubah jadi static
    public string $url;

    protected function setUp(): void
    {
        parent::setUp();
        Repository::initData();
        $this->url = config('api.version');

        if (self::$token === null) {
            $res = Http::post('http://backend-api-user:8000/'. env('USER_API_VERSION') . '/auth/login', [
                'username' => Repository::USERNAME,
                'password' => Repository::PASSWORD
            ]);
            $cookies = $res->header('Set-Cookie');
            preg_match('/access_token=([^;]+)/', $cookies, $matches);
            self::$token = $matches[1] ?? null;

            if (self::$token === null) {
                throw new \Exception('Failed to get access token from user API. Response: ' . $res->body());
            }
        }
    }

    protected function tearDown(): void
    {
        Repository::clearData();
        parent::tearDown();
    }
}
