<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Tests\utils\Repository;

abstract class TestCase extends BaseTestCase
{
    public ?string $token = null;
    public string $url;

    protected function setUp(): void
    {
        parent::setUp();
        Repository::initData();
        $this->url = config('api.version');

        if ($this->token === null) {
            $res = Http::post('http://backend-api-user:8000/'. env('USER_API_VERSION') . '/auth/login', [
                'username' => Repository::USERNAME,
                'password' => Repository::PASSWORD
            ]);
            $cookies = $res->header('Set-Cookie');
            preg_match('/access_token=([^;]+)/', $cookies, $matches);
            $this->token = $matches[1] ?? null;
        }
    }

    protected function tearDown(): void
    {
        Repository::clearData();
        parent::tearDown();
    }
}
