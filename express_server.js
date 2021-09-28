const express = require('express');
const app = express();
const PORT = 8080;

// middleware -- converts POST request body from a Buffer to a string (human-readable)
// adds the data to the req object under the key body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// tells Express app to use EJS as its templating/view engine 
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

// points to template for table with short & long urls 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // { urls: { shortURL: longURL, shortURL: longURL }}
  res.render("urls_index", templateVars);
})

// route definition to get the form -- points to template to create new short url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

// defines route that will match the form POST request & handle it 
app.post("/urls", (req, res) => {
  console.log(req.body); // log the POST request body to the console
  res.send("Ok"); // respond with "Ok" -- to be replaced
})

// generate a random shortURL (string)
const generateRandomString = () => {

}

// points to template for rending info about a single url 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
})

// adding HTML code to a response - rendered on the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body> Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

