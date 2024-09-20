import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../components/EmptyState";
import SearchInput from "../../components/SearchInput";
import VideoCard from "../../components/VideoCard";
import { useGlobalContext } from "../../context/GlobalProvider";
import { getUserPosts, logout } from "../../lib/appwrite";
import useAppwrite from "../../lib/useAppwrite";
import { icons } from "../../constants";
import InfoBox from "../../components/InfoBox";
import { router } from "expo-router";

const Profile = () => {
	const { user, setUser, setIsLoggedIn } = useGlobalContext();
	const { data: posts, isLoading, refetch } = useAppwrite(() => getUserPosts(user.$id));

	const handleLogout = async () => {
		await logout();
		setUser(null);
		setIsLoggedIn(false);
		router.replace("/sign-in");
	};

	return (
		<SafeAreaView className="bg-primary h-full">
			<FlatList
				data={posts}
				keyExtractor={(item) => item.$id}
				renderItem={({ item }) => <VideoCard videoData={item} />}
				ListHeaderComponent={() => (
					<View className="w-full justify-center items-center mt-6 mb-12 px-4">
						<TouchableOpacity className="w-full items-end mb-10" onPress={handleLogout}>
							<Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
						</TouchableOpacity>
						<View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
							<Image source={{ uri: user?.avatar }} className="w-[90%] h-[90%] rounded-lg" resizeMode="cover" />
						</View>
						<InfoBox title={user?.username} containerStyle={"mt-5"} titleStyle="text-lg" />
						<View className="mt-5 flex-row">
							<InfoBox
								title={posts?.length ?? 0}
								subtitle="Posts"
								containerStyle={"mr-10"}
								titleStyle="text-xl"
							/>
							<InfoBox title={"1.2k"} subtitle="Followers" titleStyle="text-xl" />
						</View>
					</View>
				)}
				ListEmptyComponent={() => <EmptyState title="No Videos Found" subtitle="No videos found for this search" />}
			/>
		</SafeAreaView>
	);
};

export default Profile;
