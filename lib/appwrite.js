import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

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
const storage = new Storage(client);

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
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc("$createdAt")]);

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
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [
			Query.equal("creator", userId),
			Query.orderDesc("$createdAt"),
		]);

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

export const getFilePreview = async (fileId, type) => {
	let fileUrl;

	try {
		if (type === "video") {
			fileUrl = storage.getFileView(storageId, fileId);
		} else if (type === "image") {
			fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, "top", 100);
		} else {
			throw new Error("Invalid file type");
		}

		if (!fileUrl) throw Error;

		return fileUrl;
	} catch (error) {
		throw new Error(error);
	}
};

export const uploadFile = async (file, type) => {
	if (!file) return;

	const asset = {
		name: file.fileName,
		size: file.fileSize,
		uri: file.uri,
		type: file.mimeType,
	};

	try {
		const uploadedFile = await storage.createFile(storageId, ID.unique(), asset);

		const fileUrl = await getFilePreview(uploadedFile.$id, type);
		return fileUrl;
	} catch (error) {
		throw new Error(error);
	}
};

export const createVideo = async (formData) => {
	try {
		const [thumbnailUrl, videoUrl] = await Promise.all([
			uploadFile(formData.thumbnail, "image"),
			uploadFile(formData.video, "video"),
		]);

		const newPost = await databases.createDocument(databaseId, videoCollectionId, ID.unique(), {
			title: formData.title,
			thumbnail: thumbnailUrl,
			video: videoUrl,
			prompt: formData.prompt,
			creator: formData.userId,
		});

		return newPost;
	} catch (error) {
		throw new Error(error);
	}
};
