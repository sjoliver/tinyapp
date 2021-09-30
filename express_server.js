const express = require('express');
const app = express();
const PORT = 8080;

// middleware -- converts POST request body from a Buffer to a string (human-readable)
// adds the data to the req object under the key body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// middleware -- helps us read the values from the cookie
// To set the values on the cookie, we can use res.cookie
const cookieParser = require('cookie-parser');
const { reset } = require('nodemon');
app.use(cookieParser());

// tells Express app to use EJS as its templating/view engine
app.set('view engine', 'ejs');

// generate a random shortURL (string) -- code credit to stackoverflow
// .toString creates a string from Math.random -- .substr slices the string between index 2 and 6 (inclusive)
const generateRandomString = () => { 
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  2304: {
    id: '2304',
    email: 'sophie@hot-chick.com',
    password: 'frankie'
  }
}

// given a email, will look through users object to see if that email already exists
const findUserByEmail = (email) => {
  for (const userID in users) {
    const idOfUser = users[userID];
    if (idOfUser.email === email) {
      return idOfUser;
    }
  }
  return null;
}

// defines route that will match the form POST request & handle it
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL; // log the POST request body to the console
  res.redirect(`/urls/${randomString}`);
});

// deletes an entry (key:value)
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortKey = req.params.shortURL;

  delete urlDatabase[shortKey];

  res.redirect('/urls');
});

// updating the longURL associated with a specific shortURL (ex. change qew5c from www.hello.com to www.goodbye.com)
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortKey = req.params.shortURL;
  
  // .edit comes from the <input> 'name' in urls_show
  const updatedUrl = req.body.edit;
  
  // updates the database entry to the new longURL
  urlDatabase[shortKey] = updatedUrl;

  res.redirect('/urls');
});

// 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = findUserByEmail(email);

  // if email or password are empty, send response 400 
  if (!email || !password) {
    return res.status(400).send('email or password cannot be blank');
  };

  // if email is not associated with a user, send 403
  if (!userID) {
    return res.status(403).send('no user with that email address');
  };

  // 
  if (userID.password !== password) {
    return res.status(403).send('password does not match');
  }; 
  
  res.cookie('user_id', userID.id);
  res.redirect('/urls');
});

//
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  users[id] = {
    id,
    email,
    password
  }; 

  const user = findUserByEmail(email);

  // if email or password are empty, send response 400 
  if (!email || !password) {
    return res.status(400).send('email or password cannot be blank');
  };

  // if email already exists in users obj, send response 400 
  if (user) {
    return res.status(400).send('user with that email currently exists')
  };

  res.cookie('user_id', users[id].id);
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = { user: users[userID] };
  res.render('registration', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = { user: users[userID] };
  res.render('login', templateVars);
});

// points to template for table with short & long urls
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render('urls_index', templateVars);
});

// route definition to get the form -- points to template to create new short url
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = { user: users[userID] };
  res.render('urls_new', templateVars);
});

app.get('/urls/show', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = { urls: urlDatabase, user: users[userID] };
  res.render('urls_show', templateVars);
});

// points to template for rendering info about a single url
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id'];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[userID] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

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
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});