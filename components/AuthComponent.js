import React, { useState, useRef, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";

const AuthComponent = ({ favoriteCities, setCityFromProfile }) => {
	const [authMode, setAuthMode] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);
	const containerRef = useRef(null);
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				// User is signed in
				setCurrentUser(user);
				setAuthMode(null);
			} else {
				// User is signed out
				setCurrentUser(null);
			}
		});

		return () => unsubscribe();
	}, [auth]);

	// Function to handle click outside of the component
	const handleClickOutside = (event) => {
		if (containerRef.current && !containerRef.current.contains(event.target)) {
			setAuthMode(null);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="text-center" ref={containerRef}>
			{currentUser ? (
				<Profile
					user={currentUser}
					userFavoriteCities={favoriteCities}
					onCitySelect={setCityFromProfile}
				/>
			) : (
				<>
					{authMode === "login" && <Login setAuthMode={setAuthMode} />}
					{authMode === "signup" && <Signup setAuthMode={setAuthMode} />}
					{!authMode && (
						<>
							<button
								className="text-xl text-white font-semibold focus:outline-none mr-4"
								onClick={() => setAuthMode("login")}
							>
								Login
							</button>
							<button
								className="text-xl text-white font-semibold focus:outline-none"
								onClick={() => setAuthMode("signup")}
							>
								Sign Up
							</button>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default AuthComponent;
