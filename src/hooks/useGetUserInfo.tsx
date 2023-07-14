import { get_user } from "@/utils/firebase";
import { useEffect, useState } from "react";
import { User, Company } from "@/types";

function useGetUserInfo() {
    const [user, setUser] = useState<User | null | undefined>(null);
    const [company, setCompany] = useState<Company | null | undefined>();

    useEffect(() => {
        (async () => {
            const firebase_user = await get_user();
            if (firebase_user?.user) {
                setUser(firebase_user.user as User | null | undefined);
            }
            if (firebase_user?.company) {
                setCompany(firebase_user.company as Company | null | undefined);
            }
        })();
    }, []);

    return {
        user,
        company
    };
}

export {
    useGetUserInfo,
};
