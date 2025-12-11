import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export const useSyncUserEmail = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      localStorage.setItem("userEmail", user.primaryEmailAddress.emailAddress);
    }
  }, [user]);
};
