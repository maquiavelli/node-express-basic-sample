const express = require("express");
const moment = require("moment");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());

const posts = [];

function logRequests(request, response, next) {
  const { method, url } = request;

  const now = moment(new Date()).format("HH:mm:ss - MM/DD/YYYY");

  const logLabel = `[${method.toUpperCase()}] ${url} requested at ${now}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
}

function validatePostId(request, response, next) {
  const { post_id } = request.params;

  if (!isUuid(post_id)) {
    return response.status(400).json({ erro: "Invalid post ID." });
  }

  return next();
}

app.use(logRequests);
app.use("/posts/:post_id", validatePostId);

app.get("/posts", (request, response) => {
  const { title } = request.query;

  const results = title
    ? posts.filter((post) => post.title.includes(title))
    : posts;

  return response.json(results);
});

app.post("/posts", (request, response) => {
  const { title, description } = request.body;

  const post = { id: uuid(), title, description };

  posts.push(post);

  return response.json(post);
});

app.put("/posts/:post_id", (request, response) => {
  const { post_id } = request.params;
  const { title, description } = request.body;

  const postIndex = posts.findIndex((p) => p.id === post_id);

  if (postIndex < 0) {
    return response.status(400).json({ error: "Post not found!" });
  }

  const post = { id: post_id, title, description };

  posts[postIndex] = post;

  return response.json(post);
});

app.delete("/posts/:post_id", (request, response) => {
  const { post_id } = request.params;

  const postIndex = posts.findIndex((p) => p.id === post_id);

  if (postIndex < 0) {
    return response.status(400).json({ error: "Post not found!" });
  }

  posts.splice(postIndex, 1);

  return response.status(204).send();
});

const availableRoutes = app._router.stack
  .filter((x) => x.route && x.route.path && Object.keys(x.route.methods) != 0)
  .map((layer) => ({
    method: layer.route.stack[0].method.toUpperCase(),
    path: layer.route.path,
  }));

app.listen(3333, () => {
  const now = moment(new Date()).format("HH:mm:ss - MM/DD/YYYY");
  console.log("\n");
  console.log(`🚀 Server is working at ${now}`);
  console.table(availableRoutes);
});
