import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";

export const config = {
	endpoint: "https://cloud.appwrite.io/v1",
	platform: "com.pdn.aora",
	projectId: "66ec0bc00004b9dbb166",
	databaseId: "66ec0d61000ae6e2aa91",
	userCollectionId: "66ec0d93003514c81467",
	videoCollectionId: "66ec0dbb0011183a79ae",
	storageId: "66ec0f28002c0c54e822",
};

const { databaseId, endpoint, platform, projectId, storageId, userCollectionId, videoCollectionId } = config;

// Init your React Native SDK
const client = new Client();

client
	.setEndpoint(config.endpoint) // Your Appwrite Endpoint
	.setProject(config.projectId) // Your project ID
	.setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
	try {
		const newAccount = await account.create(ID.unique(), email, password, username);
		if (!newAccount) throw Error;

		const avatarUrl = avatars.getInitials(username);

		await login(email, password);

		const newUser = await databases.createDocument(config.databaseId, config.userCollectionId, ID.unique(), {
			accountId: newAccount.$id,
			email,
			username,
			avatar: avatarUrl,
		});

		return newUser;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

export async function login(email, password) {
	try {
		const session = await account.createEmailPasswordSession(email, password);

		return session;
	} catch (error) {
		throw new Error(error);
	}
}

export const getCurrentUser = async () => {
	try {
		const currentAccount = await account.get();
		if (!currentAccount) throw Error;

		const currentUser = await databases.listDocuments(config.databaseId, config.userCollectionId, [
			Query.equal("accountId", currentAccount.$id),
		]);

		if (!currentUser) throw Error;

		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
	}
};

export const getAllPosts = async () => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

export const getLatestPosts = async () => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [
			Query.orderDesc("$createdAt", Query.limit(7)),
		]);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

export const getSearchPosts = async (query) => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.search("title", query)]);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

export const getUserPosts = async (userId) => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.equal("creator", userId)]);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

export const logout = async () => {
	try {
		const session = await account.deleteSession("current");
		return session;
	} catch (error) {
		throw new Error(error);
	}
};
