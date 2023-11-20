import React from "react";
import { getAuth, signOut } from "firebase/auth";

const Profile = ({ user }) => {
	const auth = getAuth();

	const handleLogout = () => {
		signOut(auth).catch((error) => console.error("Error signing out:", error));
	};

	return (
		<div className="p-4 bg-white rounded-lg shadow border border-gray-200 max-w-xs mx-auto my-4">
			<p className="text-lg font-medium text-gray-800">
				Welcome, <span className="text-gray-600">{user.email}</span>
			</p>
			<button
				onClick={handleLogout}
				className="mt-3 w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-300 ease-in-out"
			>
				Logout
			</button>
		</div>
	);
};

export default Profile;
