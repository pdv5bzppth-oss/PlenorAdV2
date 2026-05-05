import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const STORAGE_BUCKET = 'make-9a7b4805-images';

// 🔹 Reusable clients
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

// 🔹 Init storage (non-blocking)
(async () => {
  try {
    const { data: buckets } = await adminClient.storage.listBuckets();
    const exists = buckets?.some(b => b.name === STORAGE_BUCKET);

    if (!exists) {
      await adminClient.storage.createBucket(STORAGE_BUCKET, { public: false });
      console.log("Created bucket:", STORAGE_BUCKET);
    }
  } catch (err) {
    console.log("Storage init failed:", err);
  }
})();

// 🔹 Auth helper
const getAuthenticatedUser = async (authHeader?: string) => {
  try {
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data?.user) return null;

    return data.user;
  } catch {
    return null;
  }
};

// 🔹 Health
app.get("/make-server-9a7b4805/health", (c) => {
  return c.json({ status: "ok" });
});

// 🔹 Signup
app.post("/make-server-9a7b4805/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
      },
    });
  } catch {
    return c.json({ error: "Signup failed" }, 500);
  }
});

// 🔹 Login
app.post("/make-server-9a7b4805/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 401);
    }

    return c.json({
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
      },
    });
  } catch {
    return c.json({ error: "Login failed" }, 500);
  }
});

// 🔹 Upload image
app.post("/make-server-9a7b4805/upload-image", async (c) => {
  const user = await getAuthenticatedUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const buffer = await file.arrayBuffer();

    const { error } = await adminClient.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      return c.json({ error: "Upload failed" }, 500);
    }

    const { data } = await adminClient.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    return c.json({ url: data?.signedUrl || "" });
  } catch {
    return c.json({ error: "Upload failed" }, 500);
  }
});

// 🔹 Articles (GET)
app.get("/make-server-9a7b4805/articles", async (c) => {
  const user = await getAuthenticatedUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const articles = await kv.getByPrefix(`articles:${user.id}:`);
  return c.json({ articles });
});

// 🔹 Create article
app.post("/make-server-9a7b4805/articles", async (c) => {
  const user = await getAuthenticatedUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const article = await c.req.json();
  const id = Date.now().toString();

  const full = {
    ...article,
    id,
    userId: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collaborators: [user.id],
    comments: [],
  };

  await kv.set(`articles:${user.id}:${id}`, full);
  return c.json({ article: full });
});

// 🔹 Update article
app.put("/make-server-9a7b4805/articles/:id", async (c) => {
  const user = await getAuthenticatedUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const updates = await c.req.json();

  const existing = await kv.get(`articles:${user.id}:${id}`);
  if (!existing) return c.json({ error: "Not found" }, 404);

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await kv.set(`articles:${user.id}:${id}`, updated);
  return c.json({ article: updated });
});

// 🔹 Delete article
app.delete("/make-server-9a7b4805/articles/:id", async (c) => {
  const user = await getAuthenticatedUser(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await kv.del(`articles:${user.id}:${id}`);
  return c.json({ success: true });
});

Deno.serve(app.fetch);