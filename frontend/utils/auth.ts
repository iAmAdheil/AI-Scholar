import {
  GoogleSignin,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

export const googleLogin: () => Promise<string | null> = async () => {
  try {
    const response = await GoogleSignin.signIn();

    if (isNoSavedCredentialFoundResponse(response as any)) {
      console.log("No saved credentials found");
    }

    if (isSuccessResponse(response)) {
      const idToken = response.data.idToken;
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential =
        await auth().signInWithCredential(googleCredential);
      console.log("Signed in to Firebase with Google");
      return userCredential.user.uid;
    } else {
      throw new Error("Failed to sign in to Firebase with Google");
    }
  } catch (error: any) {
    console.error("Sign-in error:", error.message);
    logout();
    return null;
  }
};

export const phoneLogin: (mobile: string) => Promise<any> = async (mobile: string) => {
  try {
    const phone = `+91${mobile}`;
    auth().settings.appVerificationDisabledForTesting = true;
    const confirmation = await auth().signInWithPhoneNumber(phone);
    if (!confirmation) {
      throw new Error("No confirmation object received after phone sign in");
    }
    console.log("Phone login successful");
    return confirmation;
  } catch (error: any) {
    console.log(error.message || "Something went wrong during phone login");
    return null;
  }
}

export const logout = async () => {
  try {
    GoogleSignin.configure();
    await GoogleSignin.signOut();
    await auth().signOut();
    console.log("User logged out");
  } catch (error: any) {
    console.error(error.message || "Something went wrong during logout");
  }
};
