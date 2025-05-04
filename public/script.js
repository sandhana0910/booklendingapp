document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    if (!username || !password || !role) {
        document.getElementById('message').textContent = 'Please fill out all fields.';
        document.getElementById('message').style.color = 'red';
        return;
    }

    // Define valid credentials
    const validCredentials = {
        lender: {
            lender1: "lenderpass1",
            lender2: "lenderpass2",
            lender3: "lenderpass3"
        },
        borrower: {
            borrower1: "borrowerpass1",
            borrower2: "borrowerpass2",
            borrower3: "borrowerpass3"
        }
    };

    // Check login credentials
    if (validCredentials[role] && validCredentials[role][username] === password) {
        localStorage.setItem('userRole', role); // Store role in local storage
        localStorage.setItem('userName', username); // Store username in local storage
        document.getElementById('message').textContent = `Redirecting to ${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard...`;
        document.getElementById('message').style.color = 'green';
        setTimeout(() => {
            window.location.href = role + '.html'; // Navigate to role-based page
        }, 1000);
    } else {
        document.getElementById('message').textContent = 'Invalid login credentials.';
        document.getElementById('message').style.color = 'red';
    }
});
