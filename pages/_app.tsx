import "../styles/globals.css";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../components/Loading";
import { auth, db } from "../config/firebase";
import Login from "./login";

export default function App({ Component, pageProps }: AppProps) {
  const [loggedUser, loading, _error] = useAuthState(auth);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const setUserInDb = async () => {
      try {
        await setDoc(
          doc(db, "users", loggedUser?.uid as string),
          {
            email: loggedUser?.email,
            lastSeen: serverTimestamp(),
            photoURL: loggedUser?.photoURL,
          },
          {
            merge: true, // just update what is changed
          }
        );
      } catch (error) {
        console.log("ERROR SETTING USER INFO IN DATABASE::", error);
      }
    };

    if (loggedUser) {
      setUserInDb();
      setHasMounted(true);
    }
  }, [loggedUser]);
  if (loading) return <Loading />;

  if (!loggedUser) return <Login />;

  return <Component {...pageProps} />;
}
