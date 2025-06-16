document.addEventListener("DOMContentLoaded", () => {
  const toggleLink = document.getElementById("toggle-link");
  const formTitle = document.getElementById("form-title");
  const toggleText = document.getElementById("toggle-text");
  const signupFields = document.getElementById("signup-fields");
  const signinFields = document.getElementById("signin-fields");
  const submitBtn = document.getElementById("submit-btn");
  const authForm = document.getElementById("auth-form");
  const passwordInput = document.getElementById("signup-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordMismatch = document.getElementById("passwordMismatch");

  let isSignUp = true;

  function toggleForm(e) {
    e.preventDefault();
    isSignUp = !isSignUp;

    if (isSignUp) {
      formTitle.textContent = "Sign Up";
      toggleText.innerHTML = `Already have an account? <a href="#" id="toggle-link">Sign In</a>`;
      signupFields.classList.remove("d-none");
      signinFields.classList.add("d-none");
      submitBtn.textContent = "Sign Up";
    } else {
      formTitle.textContent = "Sign In";
      toggleText.innerHTML = `Don't have an account? <a href="#" id="toggle-link">Sign Up</a>`;
      signupFields.classList.add("d-none");
      signinFields.classList.remove("d-none");
      submitBtn.textContent = "Sign In";
    }

    document.getElementById("toggle-link").addEventListener("click", toggleForm);
  }

  toggleLink.addEventListener("click", toggleForm);

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      passwordMismatch.classList.toggle("d-none", passwordInput.value === confirmPasswordInput.value);
    });
  }

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (forgotPasswordFields.classList.contains("d-none")) {
      // Normal Sign In / Sign Up
      if (!isSignUp) {
        // Sign In
        const username = document.getElementById("signin-username").value;
        const password = document.getElementById("signin-password").value;

        try {
          const response = await fetch("http://localhost:5000/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("username", data.username);
            alert("Login successful! Redirecting to Home...");
            window.location.href = "home.html";
          } else {
            alert(data.error);
          }
        } catch (error) {
          alert("Error connecting to server.");
        }
      } else {
        // Sign Up
        const username = document.getElementById("signup-username").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password.length < 6) {
          alert("Password must be at least 6 characters long.");
          return;
        }

        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        try {
          const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem("user_id", data.user_id);
            alert("Sign-up successful! Redirecting to Sign In...");
            toggleForm(e);
          } else {
            alert(data.error);
          }
        } catch (error) {
          alert("Error connecting to server.");
        }
      }
    } else {
      // Forgot Password Mode
      const username = document.getElementById("forgot-username").value;
      const email = document.getElementById("forgot-email").value;
      const newPassword = document.getElementById("new-password").value;
      const confirmNewPassword = document.getElementById("confirm-new-password").value;

      if (newPassword.length < 6) {
        alert("New password must be at least 6 characters long.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match!");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Password reset successful! Please sign in.");
          window.location.reload();
        } else {
          alert(data.error);
        }
      } catch (error) {
        alert("Error connecting to server.");
      }
    }
  });

  // Forgot Password Toggle
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const forgotPasswordFields = document.getElementById("forgot-password-fields");

  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    formTitle.textContent = "Forgot Password";
    signupFields.classList.add("d-none");
    signinFields.classList.add("d-none");
    forgotPasswordFields.classList.remove("d-none");
    submitBtn.textContent = "Reset Password";
  });

  // New Password Mismatch Check
  const newPasswordInput = document.getElementById("new-password");
  const confirmNewPasswordInput = document.getElementById("confirm-new-password");
  const newPasswordMismatch = document.getElementById("newPasswordMismatch");

  confirmNewPasswordInput.addEventListener("input", () => {
    newPasswordMismatch.classList.toggle("d-none", newPasswordInput.value === confirmNewPasswordInput.value);
  });
});
