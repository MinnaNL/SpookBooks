// Modal och användarinfo
const auth = document.querySelector("#auth");
const Greeting = document.querySelector("#Greeting h2");
const authContainer = document.querySelector("#authContainer");
const spookShelfContainer = document.querySelector("#spookShelfContainer");
const closeModalBtn = document.querySelector("#closeModalBtn");
const closeAuthBtn = document.querySelector("#closeAuthBtn");

// Boklista
const library = document.getElementById("library");
const spookShelf = document.querySelector("#spookShelf");

// Login och registrering
const loginUsername = document.querySelector("#identifier");
const loginPassword = document.querySelector("#password");
const registerUsername = document.querySelector("#registerUsername");
const registerEmail = document.querySelector("#registerEmail");
const registerPassword = document.querySelector("#registerPassword");
const registerBtn = document.querySelector("#registerBtn");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");

// Sparade böcker och sortering
//savedBooksBtn = SpookShelfBtn
const spookShelfBtn = document.querySelector("#spookShelfBtn");
const sortByTitle = document.querySelector("#sortByTitle");
const sortByAuthor = document.querySelector("#sortByAuthor");

// ===========================
// Modal-relaterade funktioner
// ===========================

// Auth Modal 
//shows modal and resets values
auth.addEventListener("click", () => {
	authContainer.classList.remove("hidden");
	authContainer.classList.add("open");
	loginUsername.value = "";
	loginPassword.value = "";
	registerUsername.value = "";
	registerEmail.value = "";
	registerPassword.value = "";
});

//Also able to close via (x) close btn
closeAuthBtn.addEventListener("click", () => {
	authContainer.classList.remove("open");
	authContainer.classList.add("hidden");
});

//
window.addEventListener("click", (event) => {
	if (event.target == authContainer || event.target == spookShelfContainer) {
		authContainer.classList.remove("open");
		spookShelfContainer.classList.remove("open");
		location.reload();
	}
});

//SpookShelf Modal

//When opened, remove hidden and add open class
function openModal() {
	spookShelfContainer.classList.remove("hidden");
	spookShelfContainer.classList.add("open");
}

//Hides SpookShelfContainer
function closeModal() {
	spookShelfContainer.classList.remove("open"); //removes open class
	spookShelfContainer.classList.add("hidden"); // adds hidden class
}

// Also closes via (X) close bn
closeModalBtn.addEventListener("click", () => {
	spookShelfContainer.classList.remove("open");
	spookShelfContainer.classList.add("hidden");
});

//Auth

// Function for registration
const register = async () => {
	const username = registerUsername.value;
	const email = registerEmail.value;
	const password = registerPassword.value;
	try {
		let response = await axios.post(
			"http://localhost:1337/api/auth/local/register",
			{
				username,
				email,
				password,
			}
		);

		if (response.status === 200) {
			alert("Registration successful, proceed to login");
			registerUsername.value = "";
			registerEmail.value = "";
			registerPassword.value = "";
		} else {
			throw new Error(response.data.message);
		}
	} catch (error) {
		console.log("Registration failed:", error);
		alert("Registration failed, try again");
	}
};

// Function for login
async function login() {
	const identifier = loginUsername.value;
	const password = loginPassword.value;

	library.innerHTML = "";

	try {
		const response = await axios.post("http://localhost:1337/api/auth/local", {
			identifier,
			password,
		});

		if (response.status === 200) {
			const { jwt, user } = response.data;
			sessionStorage.setItem("token", jwt);
			sessionStorage.setItem("user", JSON.stringify(user));
			renderPage();
		} else {
			throw new Error("Wrong login info");
		}
	} catch (error) {
		console.log("Failed to login:", error);
		alert("Failed to login, try again");
	}
}
//Function for logout;
function logout() {
	// Removes token, user and savedBooks from the session
	sessionStorage.removeItem("token");
	sessionStorage.removeItem("user");
	sessionStorage.removeItem("savedBooks");

	// Hides saveBookButtons if not logged in
	const saveBookButtons = document.querySelectorAll(".saveToShelfBtn");
	saveBookButtons.forEach((btn) => btn.classList.add("hidden"));

	// Updates DOM, 
	Greeting.innerHTML = "";
	spookShelf.innerHTML = "";
	auth.classList.remove("hidden"); //shows login btn
	logoutBtn.classList.add("hidden"); //hides logut btn
	spookShelfBtn.classList.add("hidden"); //hides SPookShelf btn
}

registerBtn.addEventListener("click", register);
loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);

// Capitalize function for username
function capitalizeUsername(username) {
	return username.charAt(0).toUpperCase() + username.slice(1);
}
// Render page and get books and display
async function renderPage() {
	if (sessionStorage.getItem("token")) {
		let username = JSON.parse(sessionStorage.getItem("user")).username;

		// Capitalize username
		username = capitalizeUsername(username);

		Greeting.innerHTML = `The spirits welcome you, ${username}! `;
		auth.classList.add("hidden");
		spookShelfBtn.classList.remove("hidden");
		logoutBtn.classList.remove("hidden");
		authContainer.classList.add("hidden");
	} else {
		Greeting.innerHTML = "";
		auth.classList.remove("hidden");
		spookShelfBtn.classList.add("hidden");
		logoutBtn.classList.add("hidden");
	}
	getBooks();
}

//Makes SpookShelf visable if logged in
spookShelfBtn.addEventListener("click", () => {
	getSavedBooks();
	spookShelfContainer.classList.remove("hidden"); 
	spookShelfContainer.classList.add("open"); // adds open to show modal
});

// Get books from api
async function getBooks() {
	try {
		const response = await axios.get(
			"http://localhost:1337/api/books?populate=cover" // Lägg till 'populate=cover' här för att hämta omslagsbilder
		);
		const books = response.data.data; // Hämta böckerna från 'data' i svaret
		library.innerHTML = ""; // Rensa tidigare listan av böcker
		books.forEach((book) => displayBooks(book)); // Skicka varje bok till displayBooks för visning
		saveToShelfListener(); // Lägg till eventlistener för att markera böcker som lästa
	} catch (error) {
		console.log("Could not fetch books:", error); // Fångar eventuella fel och loggar dem
	}
}

// Strapi Themes
const setTheme = async () => {
	try {
		const response = await axios.get("http://localhost:1337/api/theme");
		const theme = response.data.data.theme;

		document.body.classList.add(theme);
	} catch (error) {
		console.error("Could not set theme", error);
	}
};

//display books
function displayBooks(book) {
	const libraryElement = document.getElementById("library");
	const { title, author, pages, published, cover, id } = book;

	// Skapa bokens kolumn
	const bookCard = document.createElement("div");
	bookCard.classList.add("col", "d-flex", "justify-content-center", "mb-3");

	// Skapa innehållet för boken
	bookCard.innerHTML = `
    <div class="card">
      <div class="card-body d-flex flex-column">
        <div class="image-container mb-2">
          <img src="${
						cover?.url
							? `http://localhost:1337${cover.url}`
							: "placeholder-image-url"
					}" 
               alt="${title} Cover" 
               class="img-fluid">
        </div>
        <h4 class="card-title">${title}</h4>
        <p class="card-text">Author: ${author}</p>
        <p class="card-text fw-light ">Pages: ${pages}</p>
        <p class="card-text  fw-light mb-2">Published: ${published}</p>
      </div>
    </div>
  `;

	// adds "Save to SpookShelf" btn if logged in
	if (sessionStorage.getItem("token")) {
		const buttonWrapper = document.createElement("div");
		buttonWrapper.classList.add("mt-auto");

		const saveToShelfButton = document.createElement("button");
		saveToShelfButton.classList.add(
			"btn",
			"btn-sm",
			"w-100",
			"py-2",
			"text-center",
			"saveToShelfBtn"
		);
		saveToShelfButton.setAttribute("data-book-id", id);

		// icon + text btn
		saveToShelfButton.innerHTML = `<i class="fa-solid fa-bookmark"></i> Save to SpookShelf`;

		buttonWrapper.appendChild(saveToShelfButton);
		bookCard.querySelector(".card-body").appendChild(buttonWrapper);
	}

	// add to SpookSHelf
	libraryElement.appendChild(bookCard);

	// eventListener for "save to SPookSHelf" btn
	saveToShelfListener();
}

//Save to SpookSHelf
function saveToShelfListener() {
	let saveToShelfBtn = document.querySelectorAll(".saveToShelfBtn");

	saveToShelfBtn.forEach((btn) => {
		btn.replaceWith(btn.cloneNode(true)); // Ta bort gamla event listeners
	});

	saveToShelfBtn = document.querySelectorAll(".saveToShelfBtn"); // Hämta nya knappar
	if (sessionStorage.getItem("token")) {
		saveToShelfBtn.forEach((btn) => {
			btn.addEventListener("click", (event) => {
				const bookId = event.target.getAttribute("data-book-id");
				putInShelf(bookId);
			});
		});
	}
}

// Put saved book in SpookSHelf
async function putInShelf(bookId) {
	const token = sessionStorage.getItem("token");
	const userId = JSON.parse(sessionStorage.getItem("user")).id;

	try {
		let response = await axios.put(
			`http://localhost:1337/api/users/${userId}`,
			{
				savedBooks: { connect: [bookId] },
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.status === 200) {
			alert("Book saved to your SpookShelf");
			getSavedBooks(); // Uppdate list
		} 
	} catch (error) {
		console.log("Failed to save book:", error);
		alert("Failed to save book to SpookShelf");
	}
}

// Get saved books
async function getSavedBooks() {
	const token = sessionStorage.getItem("token");
	const userId = JSON.parse(sessionStorage.getItem("user")).id;

	try {
		const response = await axios.get(
			`http://localhost:1337/api/users/${userId}?populate=savedBooks`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		const savedBooks = response.data.savedBooks;

		// Checks if SpookShelf is empty (no saved books)
		if (savedBooks.length === 0) {
			// If empty show message
			//empty spookshelf= haunted by ghosts
			spookShelf.innerHTML = `<p>You have not saved any books yet</p> <p>Your spookshelf is empty and haunted by ghosts!</p>  <p><i class="fa-solid fa-ghost fs-2"></i>  <i class="fa-solid fa-ghost fs-1"></i> </p>`;
			return; // return to Stop excecution
		}

		// Sort Books
		const sortBy = sessionStorage.getItem("sortBy") || "title";
		const sortedBooks = sortBooks(savedBooks, sortBy);

		// Update DOM and save to session storage
		displaySavedBooks(sortedBooks);
		sessionStorage.setItem("savedBooks", JSON.stringify(savedBooks));
	} catch (error) {
		console.log("Could not fetch saved books:", error);
	}
}

// Display list of saved books
function displaySavedBooks(books) {
	spookShelf.innerHTML = "";

	books.forEach((book) => {
		const { title, author, published, id } = book;

		const savedBookCard = document.createElement("li");
		savedBookCard.classList.add(
			"saved-book-card",
			"d-flex",
			"row",
			"justify-content-between",
			"align-items-center",
			"mw-100",
			"p-2"
		);
		savedBookCard.innerHTML = `
    <div class="book-spine d-flex">
      <div class="book-deco d-flex col">
        <div class="d-flex row w-75">
          <h5 class="h5 card-title">${title}</h5>
          <p class="card-text">${author}</p>
        </div>
        <div class="col d-flex">
          <div>
            <p class="card-text"> Published:</p>
            <p class="card-text">${published}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-sm py-2 deleteBtn" data-book-id="${id}">Delete</button>
    </div>
          `;

		spookShelf.appendChild(savedBookCard);
	});

	// eventListener for deleting books
	let deleteBtn = document.querySelectorAll(".deleteBtn");

	deleteBtn.forEach((btn) => {
		btn.addEventListener("click", (event) => {
			const bookId = event.target.getAttribute("data-book-id");
			deleteSavedBook(bookId);
		});
	});
}

//Sort books
function sortBooks(books, sortBy) {
	return books.sort((a, b) =>
		sortBy === "title"
			? a.title.localeCompare(b.title)
			: a.author.localeCompare(b.author)
	);
}
//Handling of sorting
function handleSort(sortBy) {
	// Save sorting to session storage
	sessionStorage.setItem("sortBy", sortBy);

	// Get and Sort books
	getSavedBooks().then(() => {
		document.querySelectorAll(".sort-button").forEach((btn) => {
			btn.classList.remove("active");		//Removes active styling for disabled button

		});

		// Markera den aktuella knappen som aktiv
		const activeButton = document.querySelector(
			sortBy === "title" ? "#sortByTitle" : "#sortByAuthor"
		);
		activeButton.classList.add("active"); 		// Add active class for active sorting btn

	});
}

// Event listeners for sort btns
document.querySelector("#sortByTitle").addEventListener("click", () => {
	handleSort("title");
});

document.querySelector("#sortByAuthor").addEventListener("click", () => {
	handleSort("author");
});

// Function for deleting saved book
async function deleteSavedBook(bookId) {
	const token = sessionStorage.getItem("token");
	const userId = JSON.parse(sessionStorage.getItem("user")).id;

	try {
		let response = await axios.put(
			`http://localhost:1337/api/users/${userId}`,
			{
				savedBooks: { disconnect: [bookId] },
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.status === 200) {
			console.log("Deleted book from SpookShelf");
			getSavedBooks();
		} 
	} catch (error) {
		console.log("Failed to delete book:", error);
		alert("Could not delete book from SpookShelf");
	}
}

//render page and set strapi theme
renderPage();
setTheme();
