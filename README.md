# Introduction
A typical OAUTH2 flow involves requesting for an authorization code from the authorization server using a Client ID and secret and then requesting for a token based on the code. For cases where you don't have a 3rd party authorization service and just need to allow users to request token using a username and password combination, there is an implicit oAuth2 flow that can be used. This is useful in cases where the authorization service and the resource service is the same and there is no need to do a roundtrip to a 3rd party.

In this example, an implicit flow is used to exchange a username/password authentication for an access token which can then be used to access the restricted resource using bearer authorization. This creates a simpler oAuth implementation for usecases such as accessing API via a mobile app.

## Requirements


## Installation
* Install dependencies

        $ npm install

* Build typescript code

        $ npm run Build

* Run example oAuth Server

        $ node ./build/app.js

## Sample Requests
* Request access token for test user in the example -

        $ curl --data "username=test&password=test&grant_type=password&requestType=token" http://localhost:3000/oauth/token

* Request restricted api resources using generated token -

        $ curl --data "" -H "Authorization: Bearer [Insert Token Here]" http://localhost:3000/api/resource

* Request access token using refresh token -

        $  curl --data "refresh_token=[Insert Refresh Token Here]&grant_type=refresh_token&requestType=tp://localhost:3000/oauth/refreshtoken

