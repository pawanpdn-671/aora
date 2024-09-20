import { View, Text, ScrollView, Image, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import { createUser } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignUp = () => {
	const [formValues, setFormValues] = useState({
		username: "",
		email: "",
		password: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const { setUser, setIsLoggedIn } = useGlobalContext();

	const handleSubmit = async () => {
		if (!formValues.username || !formValues.email || !formValues.password) {
			return Alert.alert("Error", "Please fill in all the fields");
		}

		setIsSubmitting(true);
		try {
			const res = await createUser(formValues.email, formValues.password, formValues.username);

			setUser(res);
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
					<Text className="text-2xl text-white font-psemibold mt-10">Signup to Aora</Text>
					<FormField
						title="Username"
						value={formValues.username}
						handleChange={(e) => setFormValues({ ...formValues, username: e })}
						otherStyles="mt-10"
						keyboardType="email-address"
					/>
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
						title={"Sign Up"}
						handlePress={handleSubmit}
						containerStyle={"mt-10"}
						isLoading={isSubmitting}
					/>

					<View className="justify-center pt-5 flex-row gap-2">
						<Text className="text-sm text-gray-100 font-pregular">Already have an account?</Text>
						<Link href="/sign-in" className="text-sm font-pmedium text-secondary">
							Login
						</Link>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default SignUp;
