<?php

require_once __DIR__ . '/fitbit_oauth2.php';
require_once __DIR__ . '/../config.php';
use League\OAuth2\Client\Token\AccessToken;

function getLatestFitbitAccessToken($config)
{
    // Create connection
    $conn = new mysqli($config['mysql_servername'], $config['mysql_username'], $config['mysql_password'], $config['mysql_databasename']);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $fitbit_client_id = $config['fitbit_client_id'];
    $sql = "SELECT client_id, client_secret, access_token, refresh_token, expires_at FROM fitbit_oauth_tokens WHERE client_id = '$fitbit_client_id'";

    if (!$result = $conn->query($sql)) {
        echo "{'error' : 'OAuth token look up failed'}";
        exit;
    }

    if ($result->num_rows === 0) {
        echo "{'error' : 'Could not find oauth token for user.'}";
        exit;
    }

    $accessTokenValues = $result->fetch_assoc();

    $provider = new Fitbit([
        'clientId'          => $accessTokenValues['client_id'],
        'clientSecret'      => $accessTokenValues['client_secret'],
        'redirectUri'       => null
    ]);

    $accessTokenOpts = array(
    'access_token' => $accessTokenValues['access_token'],
    'refresh_token' => $accessTokenValues['refresh_token'],
    'resource_owner_id' => $accessTokenValues['client_id'],
    'expires' => $accessTokenValues['expires_at']
    );

    $accessToken = new AccessToken($accessTokenOpts);

    if ($accessToken->hasExpired()) {
        $newAccessToken = $provider->getAccessToken('refresh_token', [
            'refresh_token' => $accessToken->getRefreshToken()
        ]);

        error_log($newAccessToken);

        $new_access_token = $newAccessToken->getToken();
        $new_refresh_token = $newAccessToken->getRefreshToken();
        $new_expires_at = $newAccessToken->getExpires();

        $sql = "UPDATE fitbit_oauth_tokens SET access_token = '$new_access_token', refresh_token = '$new_refresh_token', expires_at = $new_expires_at WHERE client_id = '$fitbit_client_id'";

        if (!$result = $conn->query($sql)) {
            echo "{'error' : 'Could not refresh access token.'}";
            exit;
        }

        $accessToken = $newAccessToken;
    }

    return array( 'provider' => $provider, 'access_token' => $accessToken );
}

function requestFitbitApi($config, $apiUrl)
{
    $setupResult = getLatestFitbitAccessToken($config);

    $provider = $setupResult['provider'];
    $accessToken = $setupResult['access_token'];

    // The provider provides a way to get an authenticated API request for
    // the service, using the access token; it returns an object conforming
    // to Psr\Http\Message\RequestInterface.
    $request = $provider->getAuthenticatedRequest(
        'GET',
        $apiUrl,
        $accessToken
    );

    $response = $provider->getResponse($request);
    $jsonResponse = json_encode( $response );

    echo $jsonResponse;
}

$apiUrl = 'https://api.fitbit.com/1/user/-/profile.json';

if (isset($_GET['api_url'])) {
    $apiUrl = $_GET['api_url'];
}

requestFitbitApi($config, $apiUrl);

?>
