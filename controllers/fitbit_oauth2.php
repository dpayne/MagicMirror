<?php
/**
 * The majority of this code was taken from https://packagist.org/packages/djchen/oauth2-fitbit
 */

require_once __DIR__ . '/../vendor/autoload.php';

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Token\AccessToken;
use League\OAuth2\Client\Tool\BearerAuthorizationTrait;
use League\OAuth2\Client\Provider\ResourceOwnerInterface;
use Psr\Http\Message\ResponseInterface;

class FitbitUser implements ResourceOwnerInterface
{
    /**
     * @var array
     */
    protected $userInfo = [];
    /**
     * @param array $response
     */
    public function __construct(array $response)
    {
        $this->userInfo = $response['user'];
    }
    public function getId()
    {
        return $this->userInfo['encodedId'];
    }
    /**
     * Get the display name.
     *
     * @return string
     */
    public function getDisplayName()
    {
        return $this->userInfo['displayName'];
    }
    /**
     * Get user data as an array.
     *
     * @return array
     */
    public function toArray()
    {
        return $this->userInfo;
    }
}

class Fitbit extends AbstractProvider
{
    use BearerAuthorizationTrait;

    /**
     * Fitbit URL.
     *
     * @const string
     */
    const BASE_FITBIT_URL = 'https://www.fitbit.com';

    /**
     * Fitbit API URL.
     *
     * @const string
     */
    const BASE_FITBIT_API_URL = 'https://api.fitbit.com';

    /**
     * Get authorization url to begin OAuth flow.
     *
     * @return string
     */
    public function getBaseAuthorizationUrl()
    {
        return static::BASE_FITBIT_URL.'/oauth2/authorize';
    }

    /**
     * Get access token url to retrieve token.
     *
     * @param array $params
     *
     * @return string
     */
    public function getBaseAccessTokenUrl(array $params)
    {
        return static::BASE_FITBIT_API_URL.'/oauth2/token';
    }

    /**
     * Returns the url to retrieve the resource owners's profile/details.
     *
     * @param AccessToken $token
     *
     * @return string
     */
    public function getResourceOwnerDetailsUrl(AccessToken $token)
    {
        return static::BASE_FITBIT_API_URL.'/1/user/-/profile.json';
    }

    /**
     * Returns all scopes available from Fitbit.
     * It is recommended you only request the scopes you need!
     *
     * @return array
     */
    protected function getDefaultScopes()
    {
        return ['activity', 'heartrate', 'location', 'profile', 'settings', 'sleep', 'social', 'weight'];
    }

    /**
     * Checks Fitbit API response for errors.
     *
     * @throws IdentityProviderException
     *
     * @param ResponseInterface $response
     * @param array|string      $data     Parsed response data
     */
    protected function checkResponse(ResponseInterface $response, $data)
    {
        if ($response->getStatusCode() >= 400) {
            $errorMessage = '';
            if (!empty($data['errors'])) {
                foreach ($data['errors'] as $error) {
                    if (!empty($errorMessage)) {
                        $errorMessage .= ' , ';
                    }
                    $errorMessage .= implode(' - ', $error);
                }
            } else {
                $errorMessage = $response->getReasonPhrase();
            }
            throw new IdentityProviderException(
                $errorMessage,
                $response->getStatusCode(),
                $response
            );
        }
    }

    /**
     * Returns the string used to separate scopes.
     *
     * @return string
     */
    protected function getScopeSeparator()
    {
        return ' ';
    }

    /**
     * Returns authorization parameters based on provided options.
     * Fitbit does not use the 'approval_prompt' param and here we remove it.
     *
     * @param array $options
     *
     * @return array Authorization parameters
     */
    protected function getAuthorizationParameters(array $options)
    {
        $params = parent::getAuthorizationParameters($options);
        unset($params['approval_prompt']);
        if (!empty($options['prompt'])) {
            $params['prompt'] = $options['prompt'];
        }

        return $params;
    }

    /**
     * Builds request options used for requesting an access token.
     *
     * @param array $params
     *
     * @return array
     */
    protected function getAccessTokenOptions(array $params)
    {
        $options = parent::getAccessTokenOptions($params);
        $options['headers']['Authorization'] =
            'Basic '.base64_encode($this->clientId.':'.$this->clientSecret);

        return $options;
    }

    public function createResourceOwner(array $response, AccessToken $token)
    {
        return new FitbitUser($response);
    }
}

?>
