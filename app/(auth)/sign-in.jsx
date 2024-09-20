import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { getCurrentUser, login } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
	const [formValues, setFormValues] = useState({
		email: "",
		password: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const { setUser, setIsLoggedIn } = useGlobalContext();

	const handleSubmit = async () => {
		if (!formValues.password || !formValues.email) {
			return Alert.alert("Error", "Please fill in all the fields");
		}

		setIsSubmitting(true);
		try {
			await login(formValues.email, formValues.password);

			const result = await getCurrentUser();

			setUser(result);
			setIsLoggedIn(true);

			router.replace("/home");
		} catch (error) {
			Alert.alert("Error", error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<SafeAreaView className="bg-primary h-full">
			<ScrollView>
				<View className="w-full justify-center min-h-[85vh] px-4 my-6">
					<Image source={images.logo} resizeMode="contain" className="w-[115px] h-[35px]" />
					<Text className="text-2xl text-white font-psemibold mt-10">Login to Aora</Text>
					<FormField
						title="Email"
						value={formValues.email}
						handleChange={(e) => setFormValues({ ...formValues, email: e })}
						otherStyles="mt-7"
						keyboardType="email-address"
					/>
					<FormField
						title="Password"
						value={formValues.password}
						handleChange={(e) => setFormValues({ ...formValues, password: e })}
						otherStyles="mt-7"
					/>
					<CustomButton
						title={"Login"}
						handlePress={handleSubmit}
						containerStyle={"mt-10"}
						isLoading={isSubmitting}
					/>

					<View className="justify-center pt-5 flex-row gap-2">
						<Text className="text-sm text-gray-100 font-pregular">Don't have an account?</Text>
						<Link href="/sign-up" className="text-sm font-pmedium text-secondary">
							Sign Up
						</Link>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default SignIn;
