
// This is a mock implementation of Firebase Auth
// In a real application, you would use the Firebase SDK

export interface User {
    uid: string;
    email: string | null;
}

let currentUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

// Mock user database
const users: Record<string, string> = {
    'user@example.com': 'password123'
};

function notifyListeners() {
  listeners.forEach(listener => listener(currentUser));
}

export async function signup(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users[email]) {
        reject(new Error('An account with this email already exists.'));
        return;
      }
      users[email] = password;
      const newUser: User = { uid: Date.now().toString(), email: email };
      currentUser = newUser;
      notifyListeners();
      resolve(newUser);
    }, 1000);
  });
}

export async function login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (users[email] && users[email] === password) {
                const user: User = { uid: 'mock-uid-' + email, email: email };
                currentUser = user;
                notifyListeners();
                resolve(user);
            } else {
                reject(new Error('Invalid email or password.'));
            }
        }, 1000);
    });
}

export async function logout(): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            currentUser = null;
            notifyListeners();
            resolve();
        }, 500);
    });
}

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  listeners.push(callback);
  // Immediately call with current user
  callback(currentUser);

  // Return an unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}
