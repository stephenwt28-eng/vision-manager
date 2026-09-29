const USERS_KEY = 'catapp_users';
const CURRENT_USER_KEY = 'catapp_currentUser';

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUserEmail = () => localStorage.getItem(CURRENT_USER_KEY);

export const isLoggedIn = () => !!getCurrentUserEmail();

export const getCurrentUser = () => {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return getUsers()[email] || null;
};

export const updateCurrentUser = (patch) => {
  const email = getCurrentUserEmail();
  if (!email) return null;
  const users = getUsers();
  users[email] = { ...users[email], ...patch };
  saveUsers(users);
  return users[email];
};

export const signup = ({ firstName, lastName, email, password, phone, country, address, city, state, zip }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  if (users[normalizedEmail]) {
    return { error: 'An account with this email already exists.' };
  }
  users[normalizedEmail] = {
    firstName, lastName, email: normalizedEmail, password, phone, country,
    address, city, state, zip,
    cards: [],
  };
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
  return { user: users[normalizedEmail] };
};

export const login = (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getUsers()[normalizedEmail];
  if (!user || user.password !== password) {
    return { error: 'Incorrect email or password.' };
  }
  localStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
  return { user };
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};