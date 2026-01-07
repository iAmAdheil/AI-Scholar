import axios from "axios";
import { useToken } from "@/store/token";

export const fetchToken = async (fid: string) => {
  try {
    const { updateToken } = useToken();
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/signin`,
      {
        fid
      },
    );
    if (response.status === 200 && response.data.token) {
      updateToken(response.data.token);
      return 1;
    }
    return 0;
  } catch (error: any) {
    console.error(error.msg || "Something went wrong during login");
    return 0;
  }
};

export const removeToken = () => {
  const { deleteToken } = useToken();
  deleteToken();
};
