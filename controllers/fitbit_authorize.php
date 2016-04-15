<?php
/**
 * The majority of this code was taken from https://packagist.org/packages/djchen/oauth2-fitbit
 */

require_once __DIR__ . '/fitbit_oauth2.php';
require_once __DIR__ . '/../config.php';

$provider = new Fitbit([
    'clientId' => $config['fitbit_client_id'],
    'clientSecret' => $config['fitbit_client_secret'],
    'redirectUri' => null,
]);

// start the session
session_start();

// If we don't have an authorization code then get one
if (isset($_GET['verify'])) {

    $verification_code = 'INSERT_VERIFICATION_CODE_HERE';

    if ( $_GET['verify'] == $verification_code )
    {
        header("HTTP/1.0 204 No Content");
    }
    else
    {
        header("HTTP/1.0 404 No Content");
    }

    exit;

// Check given state against previously stored one to mitigate CSRF attack
} elseif (!isset($_GET['code'])) {

    // Fetch the authorization URL from the provider; this returns the
    // urlAuthorize option and generates and applies any necessary parameters
    // (e.g. state).
    $authorizationUrl = $provider->getAuthorizationUrl();

    // Get the state generated for you and store it to the session.
    $_SESSION['oauth2state'] = $provider->getState();

    // Redirect the user to the authorization URL.
    header('Location: ' . $authorizationUrl);

// Check given state against previously stored one to mitigate CSRF attack
} elseif (empty($_GET['state']) || ($_GET['state'] !== $_SESSION['oauth2state'])) {
    unset($_SESSION['oauth2state']);
    echo('bad state');
} else {

    try {

        // Try to get an access token using the authorization code grant.
        $accessToken = $provider->getAccessToken('authorization_code', [
            'code' => $_GET['code']
        ]);

        // We have an access token, which we may use in authenticated
        // requests against the service provider's API.
        echo $accessToken->getToken() . "\n";
        echo $accessToken->getRefreshToken() . "\n";
        echo $accessToken->getExpires() . "\n";
        echo ($accessToken->hasExpired() ? 'expired' : 'not expired') . "\n";

        $conn = new mysqli($config['mysql_servername'], $config['mysql_username'], $config['mysql_password'], $config['mysql_databasename']);

        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $new_access_token = $accessToken->getToken();
        $new_refresh_token = $accessToken->getRefreshToken();
        $new_expires_at = $accessToken->getExpires();

        $fitbit_client_id = $config['fitbit_client_id'];

        $sql = "UPDATE fitbit_oauth_tokens SET access_token = '$new_access_token', refresh_token = '$new_refresh_token', expires_at = $new_expires_at WHERE client_id = '$fitbit_client_id'";

        if (!$result = $conn->query($sql)) {
            echo "{'error' : 'Could not refresh access token.'}";
            exit;
        }

        // Using the access token, we may look up details about the
        // resource owner.
        $resourceOwner = $provider->getResourceOwner($accessToken);

        var_export($resourceOwner->toArray());

        // The provider provides a way to get an authenticated API request for
        // the service, using the access token; it returns an object conforming
        // to Psr\Http\Message\RequestInterface.
        $request = $provider->getAuthenticatedRequest(
            'GET',
            'https://api.fitbit.com/1/user/-/profile.json',
            $accessToken
        );
        // Make the authenticated API request and get the response.
        //$response = $provider->getResponse($request);

    } catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {

        // Failed to get the access token or user details.
        echo($e->getMessage());

    }
}

?>
