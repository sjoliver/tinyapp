const express = require('express');
const { findUserByEmail } = require('./helpers');
const app = express();
const PORT = 8080;

const { reset } = require('nodemon');
const e = require('express');

// middleware -- converts POST request body from a Buffer to a string (human-readable)
// adds the data to the req object under the key body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// middleware -- cookie encryption
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey1','secretKey2', 'secretKey3'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// middleware for hash encrypting
const bcrypt = require('bcryptjs');

// tells Express app to use EJS as its templating/view engine
app.set('view engine', 'ejs');

// generate a random shortURL (string) -- code credit to stackoverflow
// .toString creates a string from Math.random -- .substr slices the string between index 2 and 6 (inclusive)
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'a2304'
  },
  'we21ds': {
    longURL: 'http://www.pinterest.com',
    userID: 'a2304'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'b1234'
  }
};

const users = {
  a2304: {
    id: 'a2304',
    email: 'sophie@hot-chick.com',
    password: bcrypt.hashSync('frankie', 10)
  },
  b1234: {
    id: 'b1234',
    email: 'sophie@sophie.com',
    password: bcrypt.hashSync('frankie', 10)
  }
};

// returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id) => {
  let userURLs = [];

  for (const shortU in urlDatabase) {
    if (id === urlDatabase[shortU].userID) {
      userURLs.push(urlDatabase[shortU]);
    }
  }

  return userURLs;
};

urlsForUser('a2304');

// -------------------------
// ----- POST REQUESTS -----
// -------------------------

// defines route that will match the form POST request & handle it
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  const userID = req.session.user_id;
  
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: userID};

  if (!users[userID]) {
    res.send("Must be logged in to create a new short URL\n");
  } else {
    res.redirect(`/urls/${randomString}`);
  }

});

// deletes a shortURL/longURL entry from the list (key:value pair)
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortKey = req.params.shortURL;
  const userID = req.session.user_id;
  const urlOwner = urlDatabase[shortKey].userID;

  // checks to see if user is logged in
  if (!userID) {
    res.send('please login before continuing\n');
    return;
  }
  
  // use the urlsForUser fn to determine if user should be able to delete entry
  for (const urlObject of urlsForUser(userID)) {
    if (urlObject.userID === urlOwner) {
      delete urlDatabase[shortKey];
      res.redirect('/urls');
      return;
    }
  }

});

// updating the longURL associated with a specific shortURL (ex. change qew5c from www.hello.com to www.goodbye.com)
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortKey = req.params.shortURL;
  const userID = req.session.user_id;
  const urlOwner = urlDatabase[shortKey].userID;

  // checks to see if user is logged in
  if (!userID) {
    res.send('Please login before continuing\n');
    return;
  }
  
  // use the urlsForUser fn to determine if user should be able to edit entry
  for (const urlObject of urlsForUser(userID)) {
    if (urlObject.userID === urlOwner) {
      // .edit comes from the <input> 'name' in urls_show
      const updatedUrl = req.body.edit;
      // updates the database entry to the new longURL
      urlDatabase[shortKey].longURL = updatedUrl;
      res.redirect('/urls');
      return;
    }
  }

});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = findUserByEmail(email, users);

  // if email or password are empty, send response 400
  if (!email || !password) {
    return res.status(400).send('email or password cannot be blank');
  }

  // if email is not associated with a user, send 403
  if (!userID) {
    return res.status(403).send('no user with that email address');
  }

  const passwordCompare = bcrypt.compareSync(password, userID.password);

  // checks to see if the input password matches the hashed password saved
  if (!passwordCompare) {
    return res.status(403).send('password does not match');
  }

  req.session.user_id = userID.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// creates a new user in the users database 
// uses bcrypt to hash the password for the new user
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id,
    email,
    password: hashedPassword
  };

  // if email or password are empty, send response 400
  if (!email || !password) {
    return res.status(400).send('email or password cannot be blank');
  }

  // if email already exists in users obj, send response 400
  if (user) {
    return res.status(400).send('user with that email currently exists');
  }

  req.session.user_id = users[id].id;
  res.redirect('/urls');
});

// -------------------------
// ----- GET REQUESTS ------
// -------------------------

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };

  // redirect user to urls if already logged in
  if (userID) {
    res.redirect('/urls');
    return;
  }

  res.render('registration', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };

  // redirect user to urls if already logged in
  if (userID) {
    res.redirect('/urls');
    return;
  }
  
  res.render('login', templateVars);
});

// points to template for table with short & long urls
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[userID], userID };

  if (!users[userID]) {
    res.render('urls_unauth', templateVars); // render the template which tells user to either login or register 
  } else {
    res.render('urls_index', templateVars); // render the correct index template if user is authenticated
  }
  
});

// route definition to get the form -- points to template to create new short url
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };

  if (!users[userID]) {
    res.redirect('/login'); // redirect user to login page if they try to access the create new URL page (when unauthenticated)
  } else {
    res.render('urls_new', templateVars);
  }

});

// points to template for rendering info about a single url
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const shortU = req.params.shortURL;

  if (!urlDatabase[shortU]) {
    res.send('<html><body><h3>Invalid URL</h3><p>Please enter a valid URL to continue.</p><a href="/urls">Go back home</a></body></html>\n');
    return;
  }

  // must be declared after the above if statement (or else error is returned that longURL is not defined)
  const templateVars = { shortURL: shortU, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID] };

  if (!users[userID]) {
    res.render('urls_unauth', templateVars);
  } else if (userID !== urlDatabase[shortU].userID) {
    res.send('Short URL does not belong to you.');
  } else {
    res.render('urls_show', templateVars);
  }

});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.send('Invalid short URL');
  }

  // must be declared after the above if statement (or else error is returned that longURL is not defined)
  const longURL = urlDatabase[req.params.shortURL].longURL;

  // adds 'http://' if not present on longURL
  if (longURL.includes('http://')) {
    res.redirect(`${longURL}`);
  } else {
    res.redirect(`http://${longURL}`);
  }

});

// adding HTML code to a response - rendered on the client browser
app.get('/hello', (req, res) => {
  res.send('<html><body> Hello <b>World</b></body></html>\n');
});

app.get('/', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});