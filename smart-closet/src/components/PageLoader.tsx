import React from "react";

// file taken from Auth0 documentation
// https://developer.auth0.com/resources/guides/spa/react/basic-authentication?_gl=1*5f2v0p*_gcl_au*MTIzMTk0MjMwMS4xNzQzODg0MTQz*_ga*NjQ3MzQ3Mzc5LjE3NDM4ODQxNDQ.*_ga_QKMSDV5369*MTc0MzkwODY0OC40LjEuMTc0MzkwODc3Ni4xLjAuMA..

const PageLoader = () => {
  const loadingImg = "https://cdn.auth0.com/blog/hello-auth0/loader.svg";

  return (
    <div className="loader">
      <img src={loadingImg} alt="Loading..." />
    </div>
  );
};

export default PageLoader;
