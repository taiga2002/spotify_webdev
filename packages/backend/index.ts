import express, { Request, Response } from 'express';
import request from 'request';
import axios from 'axios';
import dotenv from 'dotenv';
import { generateRandomString } from './src/Utils';
import { URLSearchParams } from 'url';

const port = 5001;

let access_token = '';

dotenv.config();

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const app = express();

app.get('/myApi/auth/login', (req: Request, res: Response) => {
    console.log("hit login callback");
    const scope = "streaming \
               user-read-email \
               user-read-private";

    const state = generateRandomString(16);

    const auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: "http://localhost:3000/myApi/auth/callback",
        state: state
    } as any);

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

app.get('/myApi/auth/callback', (req: Request, res: Response) => {
    console.log("hit callback endpoint");
    const code = req.query.code;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: "http://localhost:3000/myApi/auth/callback",
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            res.redirect('/')
        }
    });
});

app.get('/myApi/auth/token', (req, res) => {
  res.json(
     {
        access_token: access_token
     })
})

app.get('/myApi/search', (req, res) => {
  console.log('hit search endpoint');
  // console.log("req.query", req.query);
  // console.log("access token", access_token);
  // TODO: Phase 2: Call the Search API on behalf of the client
  // https://api.spotify.com/v1/search?q=${item}&type=track
  axios.get("https://api.spotify.com/v1/search", {
    params: {
      ...req.query,
    },
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
}).then(({data}) => 
{   const tracks = data.tracks.items;
  console.log("tracks", tracks);
    const result = tracks.map((track:any) =>({  
      imageUrl: track.album.images[0].url,
      title:  track.name,
      subtitle: track.artists[0].name,
    }));
    console.log(result);
    res.json(result);
  })
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
