import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

// SIGN UP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const message = document.getElementById("signupMessage");
    const button = signupForm.querySelector('button[type="submit"]');

    message.textContent = "";
    button.disabled = true;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.replace("index.html");
    } catch (error) {
      message.textContent = getAuthError(error.code);
    } finally {
      button.disabled = false;
    }
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");
    const button = loginForm.querySelector('button[type="submit"]');

    message.textContent = "";
    button.disabled = true;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.replace("index.html");
    } catch (error) {
      message.textContent = getAuthError(error.code);
    } finally {
      button.disabled = false;
    }
  });
}

// LOGOUT
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.replace("login.html");
    } catch (error) {
      alert("Logout failed. Please try again.");
      console.error(error);
    }
  });
}

// PAGE ACCESS CHECK
const publicPages = ["login.html", "signup.html"];
const currentPage = window.location.pathname.split("/").pop() || "index.html";

onAuthStateChanged(auth, (user) => {
  const userEmail = document.getElementById("userEmail");

  if (userEmail && user) {
    userEmail.textContent = user.email;
  }

  if (!user && !publicPages.includes(currentPage)) {
    window.location.replace("login.html");
    return;
  }

  if (user && publicPages.includes(currentPage)) {
    window.location.replace("index.html");
  }
});

// FRIENDLY ERROR MESSAGES
function getAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email already has an account. Please login.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";

    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    default:
      return "Something went wrong. Please try again.";
  }
}