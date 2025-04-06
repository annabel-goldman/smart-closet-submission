import { withAuthenticationRequired } from "@auth0/auth0-react";
import React from "react";
import PageLoader from "./PageLoader"

// again not sure on the type
const AuthenticationGuard = ({component}) => {
    const Component = withAuthenticationRequired(component, {
        onRedirecting: () => (
            <PageLoader />
        ),
    });
    return <Component />;
};

export default AuthenticationGuard;