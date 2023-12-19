import crypto from "crypto";
import {clientPromise} from '../../lib/mongodb'
// import { authenticateUser } from './user-authentication'; // Replace with your user authentication logic
var http = require('http');
function getRequestBody(code){
    return "code="+code+"&grant_type=authorization_code&redirect_uri=http://127.0.0.1:3000/api/auth/callback";//TODO get this from env variables
  }

async function requestAuthToken(code){
    return new Promise((resolve,request) => {
      const requestBody = getRequestBody(code);
      console.log("request Body: " + requestBody);
      //TODO move this into a dedicated function which will return the idToken. Then saves the relevant part to db 
      const options = {
        hostname: '127.0.0.1',
        port: 5556,
        path: '/dex/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Encoding' : 'application/gzip',
          'Authorization' : 'Basic ZXhhbXBsZS1hcHA6WlhoaGJYQnNaUzFoY0hBdGMyVmpjbVYw', //this is the client secret and the client name base64 encoded
          'Content-Length' : requestBody.length
        }
      }
     
      console.log("Before http request");
      console.log("Code: " + code);
      var body = '';
  
      const postRequest = http
        .request(options, resp => {
          // log the data
          resp.on('data', d => {
            body = body + d;
          });
          resp.on('end', () => {
            console.log("Body: " + body);
            resolve(body);
            // return handleAuthRequest(res, body);
          })
        })
        .on("error", err => {
          console.log("Error: " + err.message);
        });
      postRequest.write(requestBody);
      postRequest.end();
    });
    }

function generateSessionId(){
  const buffer = crypto.randomBytes(32);
  const sessionId = buffer.toString('hex');

  return sessionId;
}

async function saveSessionData(sessionId, authToken){
  console.log("saveSessionData")
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: {sessionId,authToken},
});
  console.log("SaveSessionData Response: " + response);
}

function getSessionExpirationDate(){
  let expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours + 1);
  return expirationDate;
}


export async function handleAuthCallback(req, res) {
    console.log("handleAuthCallback");
    
    console.log("Before handleCallback");
    const result = await handleDexAuthCallback(req);
    console.log("After handleDexAuthCallback. result: " + JSON.stringify(result));
  
    // Set session ID or update user information in the session
    if (!result.success) {
      res.status(401).end('Authentication failed');
    }

    const sessionId = generateSessionId();
    console.log("Generated sessionId: " + sessionId);
    const authToken = result.authToken;
    saveSessionData(sessionId,authToken);//This will also check if the user has been logged before if not create a new user
    const expirationDate = getSessionExpirationDate();
    res.setHeader(
      'Set-Cookie',
      `sessionId=${sessionId}; Path=/; HttpOnly; Expires=${expirationDate}`
    );
  
    res.status(302).redirect('/');    
  }

export async function handleDexAuthCallback(req) {
    console.log("HandleCallback");
  try {
    const { code, state } = req.query;
    console.log("Code: " + code);
    console.log("State: " + state);
    
    // Exchange the authorization code for an access token
    const authToken = await requestAuthToken(code);
    console.log("AuthToken: " + authToken);
    // // Use the access token to get user information from DexiDP
    // const auth = await getUserInfo(authToken);

    // Authenticate the user and obtain user information
    // const user = await authenticateUser(userInfo);

    return {
      success: true,
      authToken,
    };
  } catch (error) {
    console.error('Authentication failed:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

async function exchangeCodeForAccessToken(code) {
    const tokenEndpoint = 'http://127.0.0.1:5556/dex/token'; // Replace with the actual DexiDP token endpoint
    const clientId = 'example-app'; // Replace with your client ID
    const clientSecret = 'ZXhhbXBsZS1hcHAtc2VjcmV0'; // Replace with your client secret
    const redirectUri = 'http://127.0.0.1:3000/api/auth/callback'; // Replace with your redirect URI
    
    const requestBody = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
    };
    
    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody).toString(),
    });
    
    if (!response.ok) {
        throw new Error('Failed to exchange code for access token');
    }
    console.log("Response from POST: " + response);
    const responseBody = await response.json();
    const accessToken = responseBody.access_token;
    
    return accessToken;
    }

async function getUserInfo(jsonData) {
    console.log("getUserInfo: " + jsonData);
    const jsonObject = JSON.parse(jsonData);
    const idToken = jsonObject.id_token;
    console.log("IDToken: " + idToken);
    return jsonObject;
  // Implement the logic to get user information from DexiDP using the access token
  // This may involve making a request to DexiDP userinfo endpoint
  // Return the user information
}