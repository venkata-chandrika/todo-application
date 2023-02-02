const express = require("express");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at given url");
    });
  } catch (error) {
    console.log(`DB: Error ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API 1 Returns a list of all todos whose status is 'TO DO'

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});
//ap1 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo 
        WHERE id =${todoId}`;
  const todo = await db.get(getQuery);
  response.send(todo);
});
//API 3 post
app.post("/todos/", async (require, response) => {
  const { id, todo, priority, status } = require.body;
  const updateQuery = `update todo
    set id=${id},todo ='${todo}', priority='${priority}', status='${status}';`;
  await db.run(updateQuery);
  response.send("Todo Successfully Added");
});
//API 4 update
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const reqBody = request.body;
  let updated = "";
  switch (true) {
    case reqBody.status !== undefined:
      updated = "Status";
      break;
    case reqBody.priority !== undefined:
      updated = "Priority";
      break;
    case reqBody.todo !== undefined:
      updated = "Todo";
      break;
  }
  if (updated !== undefined) {
    const todoQuery = `select * from todo where id= ${todoId}`;
    const PreviousTodo = await db.get(todoQuery);
    response.send(PreviousTodo);
    const {
      status = PreviousTodo.status,
      todo = PreviousTodo.todo,
      priority = PreviousTodo.priority,
    } = request.body;
    const updateQuery = `update todo set status='${status}', todo='${todo}',priority='${priority}'`;
    await db.run(updateQuery);
    response.send(`${updated} Updated`);
  }
});
//API delete
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `delete from todo where id=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
