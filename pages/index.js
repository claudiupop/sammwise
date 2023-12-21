import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { getDexiDPAuthenticationURL } from '../comps/authorization/authorization'
import { useRouter } from 'next/router'
import { parse } from 'cookie'

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // Check authentication status when the page loads
    fetch('/api/auth/login')
      .then((response) => {
        console.log()
        if (!response.ok) {
          console.log("Not logged in!");
          // Redirect to login page if not authenticated
          const loginUrl = getDexiDPAuthenticationURL();
          router.push(loginUrl);
        }
        else {
          console.log("logged in");
        }
      })
      .catch((error) => {
        console.error('Error checking authentication status:', error);
        // Handle error appropriately
      });
  }, []);

  useEffect(() => {
    // fetchUserData();
    const getSessionFromCookie = () => {
      const cookies = parse(document.cookie);
      // console.log("Cookies: " + JSON.stringify(cookies));
      // Check if the "session" cookie exists
      if (cookies.sessionId) {
        console.log("Cookie: sessionID is set");
        // const secret = process.env.JWT_SECRET; // Replace with your JWT secret
        try {
          // Verify the JWT token
          // const decoded = verify(cookies.session, secret);

          // Optionally, you can also check the expiration time or other claims

          // If verification is successful, set isLoggedIn to true
          // setIsLoggedIn(true);
          console.log("is logged in")
        } catch (error) {
          // Handle verification failure or expired token
          console.error('Error verifying token:', error);
          setIsLoggedIn(false);
        }
      } else {
        console.log("No cookie");
        // setIsLoggedIn(false);
      }
    };

    // Call the function on component mount
    // getSessionFromCookie();

    // console.log("Check logged status!");
    // console.log("ISLoggedIn: " + isLoggedIn);
    // if(!isLoggedIn){
    //   console.log("User is not logged in, redirecting to log in page!");
    //   //TODO build DEXIDP;
    //   const dexidpUrl = getDexiDPAuthenticationURL();
    //   router.push(dexidpUrl);

    // }
    // else {
    //   console.log("user is Logged in!");
    // }

    var testStorage = sessionStorage.getItem('assessmentState');
    if (testStorage == null) {
      // Initialise variables to keep track of user state across pages
      console.log('defualts set');
      var assessmentStateData = new Map();
      initialiseAssessmentState(assessmentStateData)
      sessionStorage.setItem('assessmentState', JSON.stringify(assessmentStateData));
      var userState = {};
      var page = 'page';
      var page_boolean = 'has_switched_page';
      var currentPageName = 'homePage';
      userState[page] = currentPageName;
      userState[page_boolean] = true;
      var navbarState = 'Governance';
      sessionStorage.setItem('userState', JSON.stringify(userState));
      sessionStorage.setItem('navbarState', navbarState);
    } else {
      var uState = JSON.parse(sessionStorage.getItem('userState'));
      uState['has_switched_page'] = true;
      uState['page'] = 'homePage';
      sessionStorage.setItem('userState', JSON.stringify(uState));
    }
  })


  function initialiseAssessmentState(statePointer) {
    //Fill assessment state as 0 (all qs are initially empty)
    for (let i = 1; i < 91; i++) {
      var key_name = 'question' + i;
      statePointer[key_name] = null;
    }
    statePointer['Company Name'] = null;
    statePointer['Project name'] = null;
    statePointer['Description of Project'] = null;
  }

  const handleClick = e => {
    e.preventDefault()
    router.push(getDexiDPAuthenticationURL())
  }



  return (
    <>
      <Head>
        <title>SAMMWise | Home </title>
        <meta name="keywords" content="owassp-calc" />
      </Head>
      <div>
        <h1 className={styles.title}>SAMMWise</h1>
        <p className={styles.paragraph}>SAMMwise provides a convenient, browser-based interface for capturing SAMM assessment responses. With this tool, users can: </p>
        <li className={styles.paragraph}>	Enter responses for a single assessment</li>
        <li className={styles.paragraph}>	Visualize the maturity results based on entered responses</li>
        <li className={styles.paragraph}>	Compare maturity results to those for a previous assessment</li>
        <p className={styles.paragraph}> Assessment responses can be saved to the user's local computer, in a JSON-formatted text file. Responses are retained only on the local system and are not shared with any other system or persons.
        </p>

        <h1 className={styles.title}>About SAMM</h1>
        <p className={styles.paragraph}>The Open Web Application Security Project's Software Assurance Maturity Model (OWASP SAMM) is an open framework to help organizations formulate and implement a strategy for software security, tailored to the specific risks facing the organization.  </p>
        <p className={styles.paragraph}>The resources provided by SAMM (including this tool) are intended to aid in: </p>
        <li className={styles.paragraph}>		Evaluating an organization’s existing software security practices;</li>
        <li className={styles.paragraph}>		Building toward a balanced software security assurance program in well-defined iterations;</li>
        <li className={styles.paragraph}>		Demonstrating concrete improvements to a security assurance program; and </li>
        <li className={styles.paragraph}>		Defining and measuring security-related activities throughout an organization.  </li>
        <p className={styles.paragraph}>SAMM was defined with flexibility in mind such that it can be utilized by small, medium, and large organizations using any style of development. Additionally, this model can be applied organization-wide, for a single line-of-business, or even for an individual project.  </p>
      </div>


    </>
  )
}
