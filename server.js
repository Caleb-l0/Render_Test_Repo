const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => res.sendFile(__dirname+'/index.html'));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // fake logic: accept if username = “user” & password = “pass”
  if(username==='user' && password==='pass'){
    res.send('Login successful!');
  } else {
    res.send('Login failed. <a href="/">Back</a>');
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Listening on ${PORT}`));
