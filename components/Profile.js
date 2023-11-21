import React, { useEffect, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import {
	collection,
	query,
	where,
	deleteDoc,
	getDocs,
} from "firebase/firestore";

const Profile = ({ user, userFavoriteCities, updateUserFavoriteCities }) => {
	// Use userFavoriteCities prop to display the list of favorite cities
	useEffect(() => {
		setFavoriteCities(userFavoriteCities);
	}, [userFavoriteCities]);
	const auth = getAuth();
	const [favoriteCities, setFavoriteCities] = React.useState([]);

	const fetchFavoriteCities = useCallback(async () => {
		try {
			const q = query(
				collection(db, "favoriteCities"),
				where("userId", "==", user.uid)
			);
			const querySnapshot = await getDocs(q);
			const cities = querySnapshot.docs.map((doc) => doc.data().city);
			setFavoriteCities(cities);
		} catch (error) {
			console.error("Error fetching favorite cities:", error);
			setFavoriteCities([]); // Ensure favoriteCities is always an array
		}
	}, [user.uid]);

	useEffect(() => {
		fetchFavoriteCities();
	}, [fetchFavoriteCities]);

	const removeFavoriteCity = async (cityName) => {
		try {
			const q = query(
				collection(db, "favoriteCities"),
				where("userId", "==", auth.currentUser.uid),
				where("city", "==", cityName)
			);
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach(async (doc) => {
				await deleteDoc(doc.ref);
			});
			fetchFavoriteCities(); // Refresh cities list
		} catch (error) {
			console.error("Error removing favorite city:", error);
		}
	};

	const handleLogout = () => {
		signOut(auth).catch((error) => console.error("Error signing out:", error));
	};

	return (
		<div className="p-4 bg-white rounded-lg shadow border border-gray-200 max-w-xs mx-auto my-4">
			<p className="text-lg font-medium text-gray-800">
				Welcome, <span className="text-gray-600">{user.email}</span>
			</p>
			<div className="my-4">
				{favoriteCities &&
					favoriteCities.map((city, index) => (
						<div
							key={index}
							className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2"
						>
							<p className="text-lg font-medium text-gray-800">{city}</p>
							<button
								onClick={() => removeFavoriteCity(city)} // Pass the city as an argument
								className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
							>
								Remove
							</button>
						</div>
					))}
			</div>
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
