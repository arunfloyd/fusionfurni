	const signUpButton = document.getElementById('signUp');
	const signInButton = document.getElementById('signIn');
	const container = document.getElementById('container');

	signUpButton.addEventListener('click', () => {
		container.classList.add("right-panel-active");
		history.pushState(null, null, '/register');
		
	});

	signInButton.addEventListener('click', () => {
		container.classList.add("left-panel-active");
		window.location.href = '/login';
	});