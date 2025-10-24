import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../firebase";
import { ChangeEvent, useEffect, useState } from "react";
export default function useLogin() {
  interface LoginData {
    email: string;
    password: string;
  }

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [error, setError] = useState<string>("Błędne hasło lub login");

  useEffect(() => {
    console.log(loginData);
  }, [loginData]);

  async function handleLogin() {
    console.log("koncowa data", loginData);
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      return userCredentials;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  return { handleChange, handleLogin, error };
}
