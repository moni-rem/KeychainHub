const USERS_KEY = "fake_users_db";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(email, password) {
  const users = getUsers();

  const exists = users.find(u => u.email === email);
  if (exists) {
    throw new Error("User already exists");
  }

  const newUser = {
    id: Date.now(),
    email,
    password,
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
}

export function loginUser(email, password) {
  const users = getUsers();

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  return user;
}
