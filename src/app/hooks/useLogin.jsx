import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import { setTokens } from "../services/localStorage.service";

const httpLogin = axios.create();
const LoginContext = React.createContext();

export const useLogin = () => {
    return useContext(LoginContext);
};

const LoginProvider = ({ children }) => {
    const [error, setError] = useState(null);

    async function signIn({ email, password }) {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.REACT_APP_FIREBASE_KEY}`;

        try {
            const { data } = await httpLogin.post(url, {
                email,
                password,
                returnSecureToken: true
            });
            setTokens(data);
        } catch (error) {
            errorCatcher(error);
            const { code, message } = error.response.data.error;
            console.log(code, message);
            if (code === 400) {
                if (message === "EMAIL_EXISTS") {
                    const errorObject = {
                        email: "Пользователь с таким Email уже существует"
                    };
                    throw errorObject;
                }
            }
            // throw new Error
        }
    }
    function errorCatcher(error) {
        const { message } = error.response.data;
        setError(message);
    }
    useEffect(() => {
        if (error !== null) {
            toast(error);
            setError(null);
        }
    }, [error]);
    return (
        <LoginContext.Provider value={{ signIn }}>
            {children}
        </LoginContext.Provider>
    );
};

LoginProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};

export default LoginProvider;
