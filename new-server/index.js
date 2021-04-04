require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const passport = require('passport')
const Auth0Strategy = require("passport-auth0")
const expressSession = require("express-session");
const app = express()

/**
 * Session Configuration
 */

const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

const {generateUuid} = require("./utils/uuid");
const {openConnection} = require('./config/database');
const {addPost, listPosts, listPost, listPostAndUpdate, listPostAndDelete} = require('./models/post');
const {addToken} = require('./models/token');
const {addUser, listUser} = require('./models/user');

const port = process.env.PORT
const whitelist = ['http://localhost:3000']

var corsOptionsDelegate = function (req, callback) {
    const corsOptions = { origin: !!whitelist.filter(w => w.indexOf(req.header('Origin')) !== -1).length };
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static(path.join(__dirname, "public")));




// adding Helmet to enhance your API's security
app.use(helmet());
// enabling CORS for all requests
app.use(cors(corsOptionsDelegate));
// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressSession(session));

/**
 * Passport Configuration
 */
const strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    async function(accessToken, refreshToken, extraParams, profile, done) {
        //console.log("extraParams >>>", extraParams);
        //console.log("PROFILE >>>", profile);
        const uuid = generateUuid();
        await addToken({uuid, userId: profile.nickname, tokenInfo: extraParams});
        await addUser({uuid, profile});
        /**
         * Access tokens are used to authorize users to an API
         * (resource server)
         * accessToken is the token to call the Auth0 API
         * or a secured third-party API
         * extraParams.id_token has the JSON Web Token
         * profile has all the information from the user
         */
        return done(null, profile);
    }
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

/// Routes

app.get("/admin", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin/login", passport.authenticate("auth0", {scope: "openid email profile"}), (req, res) => {
    res.redirect("/admin/");
});

app.get("/admin/callback", (req, res, next) => {
    passport.authenticate("auth0", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/admin/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const returnTo = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(returnTo || "/admin/");
      });
    })(req, res, next);
  });

app.get("/admin/logout", (req, res) => {
    req.logOut();
  
    let returnTo = req.protocol + "://" + req.hostname;
    const port = req.connection.localPort;
  
    if (port !== undefined && port !== 80 && port !== 443) {
      returnTo =
        process.env.NODE_ENV === "production"
          ? `${returnTo}/`
          : `${returnTo}:${port}/`;
    }
  
    const logoutURL = new URL(
      `https://${process.env.AUTH0_DOMAIN}/v2/logout`
    );
  
    const searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
    });
    logoutURL.search = searchString;
  
    res.redirect(logoutURL);
  });


app.get('/', (req, res) => {
    //res.send('Hello World!');
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.post('/admin/post', async (req, res) => {
    const result = await addPost(req.body);
    res.send(result)
})

app.get('/posts', async (req, res) => {
    const result = await listPosts();
    res.send(result)
})

app.get('/post/:uuid', async (req, res) => {
    const result = await listPost(req.params.uuid);
    res.send(result)
})

app.put('/post/:uuid', async (req, res) => {
    const result = await listPostAndUpdate(req.params.uuid, req.body);
    res.send(result)
})

app.delete('/post/:uuid', async (req, res) => {
    const result = await listPostAndDelete(req.params.uuid);
    res.send(result)
})

app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`)
    await openConnection().catch(err => console.err(err))
})


