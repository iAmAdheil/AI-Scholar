import axios from "axios";

export const fetchToken: (fid: string) => Promise<{ msg: string; token: string | null }> = async (fid: string) => {
  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/signin`,
      {
        fid
      },
    );
    throw new Error("Failed token fetch")
    if (response.status !== 200) {
      throw new Error(response.data.msg)
    }
    console.log("Token fetched successfully");
    return { msg: response.data.msg, token: response.data.token };
  } catch (error: any) {
    console.error(error.msg || "Something went wrong during login");
    return { msg: error.msg || "Something went wrong during login", token: null };
  }
};
