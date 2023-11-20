import React, { useState, useRef, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";

const AuthComponent = () => {
	const [authMode, setAuthMode] = useState(null);
	const containerRef = useRef(null);

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
		</div>
	);
};

export default AuthComponent;
