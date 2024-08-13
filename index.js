const express = require('express');
const r = require('rethinkdb');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

let connection = null;
 
r.connect({ host: 'localhost', port: 28015 }, (err, conn) => {
  if (err) throw err;
  connection = conn;
  console.log('RethinkDB’ye bağlandı');

  r.dbList().run(connection, (err, dbs) => {
    if (err) throw err;
    if (!dbs.includes('blog')) {
      r.dbCreate('blog').run(connection, (err, result) => {
        if (err) throw err;
        console.log('Blog veritabanı oluşturuldu:', result);

        r.db('blog').tableList().run(connection, (err, tables) => {
          if (err) throw err;
          if (!tables.includes('todos')) {
            r.db('blog').tableCreate('todos').run(connection, (err, result) => {
              if (err) throw err;
              console.log('Todos tablosu oluşturuldu:', result);
            });
          }
        });
      });
    } else {
      r.db('blog').tableList().run(connection, (err, tables) => {
        if (err) throw err;
        if (!tables.includes('todos')) {
          r.db('blog').tableCreate('todos').run(connection, (err, result) => {
            if (err) throw err;
            console.log('Todos tablosu oluşturuldu:', result);
          });
        }
      });
    }
  });
});


app.get('/todos', (req, res) => {
  r.db('blog').table('todos').run(connection, (err, cursor) => {
    if (err) throw err;
    cursor.toArray((err, todos) => {
      if (err) throw err;
      res.json(todos);
    });
  });
});

app.post('/todos', (req, res) => {
  const todo = req.body;
  r.db('blog').table('todos').insert(todo).run(connection, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.put('/todos/:id', (req, res) => {
  const id = req.params.id;
  const updatedTodo = req.body;
  r.db('blog').table('todos').get(id).update(updatedTodo).run(connection, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  r.db('blog').table('todos').get(id).delete().run(connection, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`http://localhost:${port} üzerinde dinleniyor`);
});